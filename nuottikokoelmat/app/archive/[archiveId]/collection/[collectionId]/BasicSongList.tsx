'use client'
import { PdfFileView, PdfFileViewParams } from '@/components/PdfFileView'
import { Song } from '@/models/song'
import { useFileMapValue } from '@/stores/fileContext'
import { useSongView } from '@/stores/SongViewContext'
import { Types } from 'mongoose'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { BasicSongCard } from './BasicSongCard'

export const BasicSongList = ({ songs }: { songs: Song[] }) => {
	const [pdfDialogParams, setPdfDialogParams] = React.useState<PdfFileViewParams | null>(null)
	const fileMap = useFileMapValue()
	const [, setSongView] = useSongView()
	const pathname = usePathname() ?? ''
	const router = useRouter()
	const onLoadPdf = (index: number) => {
		const song = songs[index]
		const file = fileMap?.get(song?._id as unknown as Types.ObjectId)
		if (file) {
			setPdfDialogParams({ fileUrl: URL.createObjectURL(file), songs, index: songs?.findIndex((s) => s._id === song._id) || 0, song })
		} else if (!pathname.endsWith('songview')) {
			router.push(pathname + '/songview')
			setSongView(() => {
				return { songs, index }
			})
		}
	}

	return (
		<div className='flex flex-col gap-4 w-full items-start pb-4'>
			{!pdfDialogParams &&
				songs.map((song, index) => <BasicSongCard key={String(song._id)} song={song} index={index} onLoadPdf={onLoadPdf} />)}
			{pdfDialogParams && <PdfFileView pdfDialogParams={pdfDialogParams} onLoadPdf={onLoadPdf} onClose={() => setPdfDialogParams(null)} />}
		</div>
	)
}
