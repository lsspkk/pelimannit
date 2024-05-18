'use client'
import { Song } from '@/models/song'
import { ScrollMode, SpecialZoomLevel, Viewer, Worker } from '@react-pdf-viewer/core'
import { Types } from 'mongoose'
import { version } from 'pdfjs-dist'
import React from 'react'
import { NpBackButton } from './NpBackButton'
import { PdfSongNavigation } from './PdfSongNavigation'

export const WorkerUrl = new URL(`https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`, import.meta.url).toString()

export type PdfFileViewParams = { fileUrl: string; songs?: Song[]; fileMap?: Map<Types.ObjectId, File>; index: number; song?: Song }

// PdfFileView is a component that displays a PDF file in a dialog using the react-pdf-viewer library.
export const PdfFileView = (
	{ pdfDialogParams, onClose, onLoadPdf }: { onLoadPdf: (index: number) => void; pdfDialogParams: PdfFileViewParams; onClose: () => void },
) => {
	const { fileUrl, fileMap, songs, index, song } = pdfDialogParams

	const file = fileMap?.get(song?._id as unknown as Types.ObjectId)
	const currentUrl = file ? URL.createObjectURL(file) : fileUrl

	return (
		<div className='fixed top-0 left-0 w-full h-full bg-white overflow-y-scroll overflow-x-hidden'>
			<NpBackButton onClick={onClose} songPage className='z-10' />

			{songs && <PdfSongNavigation songs={songs} index={index} onLoadPdf={onLoadPdf} />}

			<div className='w-[110%] min-h-full ml-[-4%] mr-[-6%] z-0 overflow-y-scroll'>
				<Worker workerUrl={WorkerUrl}>
					<Viewer fileUrl={currentUrl} defaultScale={SpecialZoomLevel.PageWidth} scrollMode={ScrollMode.Vertical} />
				</Worker>
			</div>
		</div>
	)
}
