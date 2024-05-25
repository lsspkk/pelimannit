'use client'
import { Song } from '@/models/song'
import { useFileMapValue } from '@/stores/fileContext'
import { Types } from 'mongoose'
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/pdf'
import { PDFPageProxy } from 'pdfjs-dist/types/web/interfaces'
import React, { useEffect } from 'react'
import { NpBackButton } from './NpBackButton'
import { PdfSongNavigation } from './PdfSongNavigation'

export type PdfFileViewParams = { fileUrl: string; songs?: Song[]; fileMap?: Map<Types.ObjectId, File>; index: number; song?: Song }

// to make pdf renders cancellable
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

export const PdfFileView = (
	{ pdfDialogParams, onClose, onLoadPdf }: { onLoadPdf: (index: number) => void; pdfDialogParams: PdfFileViewParams; onClose: () => void },
) => {
	const { songs, index, song } = pdfDialogParams
	const fileMap = useFileMapValue()
	const canvasRef = React.useRef<HTMLCanvasElement>(null)
	const [arrayBuffer, setArrayBuffer] = React.useState<Uint8Array | null>(null)
	const [document, setDocument] = React.useState<PDFDocumentProxy | null>(null)
	const [page, setPage] = React.useState<PDFPageProxy | null>(null)
	const [loaded, setLoaded] = React.useState(false)
	const [currentPage, setCurrentPage] = React.useState(1)

	const file = fileMap?.get(song?._id as unknown as Types.ObjectId)

	// file to uint8array
	const fileToUint8Array = async (file: File) => {
		const arrayBuffer = await file.arrayBuffer()
		const uint8Array = new Uint8Array(arrayBuffer)
		return uint8Array
	}

	useEffect(() => {
		if (file) {
			fileToUint8Array(file).then((uint8Array) => setArrayBuffer(uint8Array))
		}
	}, [file])

	const loadDocument = () => {
		if (!loaded && arrayBuffer !== null) {
			setLoaded(true)
			// @ts-ignore
			const pdfjs = window.pdfjsLib as typeof import('pdfjs-dist/types/src/pdf')
			pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'

			const documentPromise = pdfjs.getDocument(arrayBuffer).promise
			documentPromise.then((document) => setDocument(document))
			return makeCancellable(documentPromise)
		}
		return null
	}
	useEffect(() => {
		const cancellable = loadDocument()
		if (cancellable) {
			return () => cancellable.cancel()
		}
		// @ts-ignore
	}, [arrayBuffer])

	const getPage = () => {
		try {
			if (!document) {
				return
			}
			const getPagePromise = document.getPage(currentPage)
			getPagePromise.then((page) => setPage(page))
			return makeCancellable(getPagePromise)
		} catch (error) {
			console.error(error)
		}
	}

	const cachedGetPage = React.useCallback(getPage, [document, currentPage])

	useEffect(() => {
		const cancellable = cachedGetPage()
		if (cancellable) {
			return () => cancellable.cancel()
		}
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
			const scale = 1.5
			const viewport = page.getViewport({ scale })
			canvas.height = viewport.height
			canvas.width = viewport.width
			const renderPromise = page.render({ canvasContext: context, viewport: viewport }).promise
			renderPromise.then(() => {})
			return makeCancellable(renderPromise)
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		const cancellable = pageRender()
		if (cancellable) {
			return () => cancellable.cancel()
		}
		// @ts-ignore
	}, [page])

	const numPages = document?.numPages ?? 1
	const firstPage = currentPage === 1
	const lastPage = currentPage === numPages

	return (
		<div className='fixed top-0 left-0 w-full h-full bg-white overflow-y-scroll overflow-x-hidden'>
			<NpBackButton onClick={onClose} songPage className='z-10' />

			{songs && <PdfSongNavigation songs={songs} index={index} onLoadPdf={onLoadPdf} />}

			<div className='w-[110%] min-h-full ml-[-4%] mr-[-6%] z-0 overflow-y-scroll'>
				<canvas ref={canvasRef}></canvas>
			</div>
			{numPages > 1 && (
				<React.Fragment>
					{!firstPage && (
						<button
							onClick={() => setCurrentPage((prev) => prev - 1)}
							className='bg-gray-200 p-2 rounded-md hover:bg-gray-300 fixed bottom-20 left-0 text-xs w-16 text-center opacity-65'
						>
							Edellinen sivu
						</button>
					)}
					{!lastPage && (
						<button
							onClick={() => setCurrentPage((prev) => prev + 1)}
							className='bg-gray-200 p-2 rounded-md hover:bg-gray-300 fixed bottom-20 right-0 text-xs w-16 text-center opacity-65'
						>
							Seuraava sivu
						</button>
					)}
				</React.Fragment>
			)}
		</div>
	)
}
