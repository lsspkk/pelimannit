'use client'
import { PdfDialog, PdfDialogParams } from '@/components/PdfDialog'
import { PdfIframe } from '@/components/PdfIframe'
import { Song } from '@/models/song'
import { useFileMapValue } from '@/stores/fileContext'
import { Types } from 'mongoose'
import React from 'react'
import { BasicSongCard } from './BasicSongCard'

export const BasicSongList = ({ songs }: { songs: Song[] }) => {
	const [pdfDialogParams, setPdfDialogParams] = React.useState<PdfDialogParams | null>(null)
	const fileMap = useFileMapValue()
	const [iframeIndex, setIframeIndex] = React.useState<number | null>(null)
	const onLoadPdf = (index: number) => {
		const song = songs[index]
		const file = fileMap?.get(song?._id as unknown as Types.ObjectId)
		if (file) {
			setPdfDialogParams({ fileUrl: URL.createObjectURL(file), songs, index: songs?.findIndex((s) => s._id === song._id) || 0, song })
			return
		}
		setIframeIndex(index)
	}

	const showIframe = iframeIndex !== null
	return (
		<div className='flex flex-col gap-4 w-full items-start pb-4'>
			{!pdfDialogParams &&
				!showIframe &&
				songs.map((song, index) => <BasicSongCard key={String(song._id)} song={song} index={index} onLoadPdf={onLoadPdf} />)}
			{pdfDialogParams && <PdfDialog pdfDialogParams={pdfDialogParams} onLoadPdf={onLoadPdf} onClose={() => setPdfDialogParams(null)} />}
			{showIframe && <PdfIframe iframeIndex={iframeIndex} setIframeIndex={setIframeIndex} songs={songs} onLoadPdf={onLoadPdf} />}
		</div>
	)
}
