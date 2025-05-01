'use client'
import { AlternativeUrlResponse, fetchPdf } from '@/models/alternative'
import { Song } from '@/models/song'
import { redirect, usePathname, useRouter } from 'next/navigation'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/pdf'
import { PDFPageProxy } from 'pdfjs-dist/types/web/interfaces'
import React, { useEffect, useState } from 'react'
import { NpBackButton } from './NpBackButton'
import PdfPageButton from './PdfPageButton'
import { PdfSongNavigation } from './PdfSongNavigation'

const pdfjs: typeof import('pdfjs-dist/types/src/pdf') = pdfjsLib

// to make pdf renders cancellable
// for example for react strict mode or similar actual use cases
// where user does some fast action
export default function makeCancellable<T,>(promise: Promise<T>) {
	let isCancelled = false

	const wrappedPromise: typeof promise = new Promise((resolve, reject) => {
		promise.then((value) => !isCancelled && resolve(value)).catch((error: Error) => !isCancelled && reject(error))
	})

	return {
		promise: wrappedPromise,
		cancel() {
			isCancelled = true
		},
	}
}

export const PdfAlternativeFileView = (
	{ startIndex, songs, alternativeUrl }: { startIndex: number; songs: Song[]; alternativeUrl: AlternativeUrlResponse },
) => {
	const router = useRouter()
	const [index, setIndex] = useState(startIndex)
	const pathname = usePathname()

	const canvasRef = React.useRef<HTMLCanvasElement>(null)
	const [objectUrl, setObjectUrl] = React.useState<string | null>(null)
	const [document, setDocument] = React.useState<PDFDocumentProxy | null>(null)
	const [page, setPage] = React.useState<PDFPageProxy | null>(null)
	const [loaded, setLoaded] = React.useState(false)
	const [currentPage, setCurrentPage] = React.useState(1)

	useEffect(() => {
		fetchPdf(songs[index], alternativeUrl).then((blob) => {
			setObjectUrl(URL.createObjectURL(blob))
			setLoaded(false)
			setCurrentPage(1)
			setDocument(null)
			setPage(null)
		}).catch((error) => {
			console.error('Error fetching PDF:', error)
		})
	}, [index, alternativeUrl, songs])

	const loadDocument = () => {
		if (!loaded && objectUrl !== null) {
			setLoaded(true)
			// if want to use dynamic import, then use this:
			// 			const pdfjs = window.pdfjsLib as typeof import('pdfjs-dist/types/src/pdf')
			pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'

			const documentPromise = pdfjs.getDocument(objectUrl).promise
			documentPromise.then((document) => setDocument(document))
			return makeCancellable(documentPromise)
		}
		return null
	}
	useEffect(() => {
		const cancellable = loadDocument()
		if (cancellable) {
			return () => {
				cancellable.cancel()
			}
		}
		// loadDocument does not change, only objectUrl changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [objectUrl])

	const getPage = () => {
		try {
			if (!document) {
				return
			}
			const getPagePromise = document.getPage(currentPage)
			getPagePromise.then((page) => {
				setPage(page)
			})
			return makeCancellable(getPagePromise)
		} catch (error) {
			console.error('Error fetching page:', error)
		}
	}

	const cachedGetPage = React.useCallback(getPage, [document, currentPage])

	useEffect(() => {
		const cancellable = cachedGetPage()
		return () => cancellable?.cancel()
		// getPage does not change, only currentPage changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [document, currentPage])

	const pageRender = () => {
		try {
			if (!page || !canvasRef.current) {
				return
			}
			const canvas = canvasRef.current
			const context = canvas.getContext('2d')
			if (!context) {
				return
			}
			const scale = canvas.parentElement ? canvas.parentElement.clientWidth / page.getViewport({ scale: 1 }).width : 1.5
			const viewport = page.getViewport({ scale, rotation: 0 })
			canvas.height = viewport.height
			canvas.width = viewport.width

			const renderTask = page.render({ canvasContext: context, viewport: viewport })
			renderTask.promise.catch((error: any) => {
				if (error.name !== 'RenderingCancelledException') {
					console.error('Render error:', error)
				}
			})
			return makeCancellable(renderTask.promise)
		} catch (error) {
			console.error('Error during rendering:', error)
		}
	}

	// relying on page number here seems to work well with react strict mode
	useEffect(() => {
		if (page) {
			const cancellable = pageRender()
			window.addEventListener('resize', pageRender)

			return () => {
				cancellable?.cancel()
				window.removeEventListener('resize', pageRender)
			}
		}
		// pageRender does not change, page does.
		// checking pagenumber is enough here
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page?.pageNumber])

	const numPages = document?.numPages ?? 1
	const firstPage = currentPage === 1
	const lastPage = currentPage === numPages

	const iframeUrl = songs && index >= 0 && index < songs.length ? songs[index].url : null

	if (!iframeUrl) {
		const parentPath = pathname?.substring(0, pathname.lastIndexOf('/'))
		parentPath && redirect(parentPath)
		return null
	}

	return (
		<div className='fixed top-0 left-0 w-full h-full bg-white overflow-y-scroll overflow-x-hidden '>
			<NpBackButton
				onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
					e.preventDefault()
					router.back()
				}}
				className='z-10 -mr-2 -mt-6'
				songPage
			/>

			<PdfSongNavigation songs={songs} index={index} onLoadPdf={(index) => setIndex(index)} />

			<div className='w-[110%] min-h-full ml-[-4%] mr-[-6%] z-0 overflow-y-scroll'>
				<canvas ref={canvasRef}></canvas>
			</div>
			{numPages > 1 && (
				<React.Fragment>
					{!firstPage && (
						<PdfPageButton onClick={() => setCurrentPage((prev) => prev - 1)} disabled={firstPage} label='Edellinen sivu' position='left' />
					)}
					{!lastPage && (
						<PdfPageButton onClick={() => setCurrentPage((prev) => prev + 1)} disabled={lastPage} label='Seuraava sivu' position='right' />
					)}
				</React.Fragment>
			)}
		</div>
	)
}
