'use client'

import { ArchiveSongList } from '@/components/archiveSongList/ArchiveSongList'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { NpBackButton } from '@/components/NpBackButton'
import { NpMain } from '@/components/NpMain'
import { NpToast } from '@/components/NpToast'
import { PdfFileView, PdfFileViewParams } from '@/components/PdfFileView'
import { useArchiveSongs } from '@/models/swrApi'
import { useFileMapValue } from '@/stores/fileContext'
import { useSongView } from '@/stores/SongViewContext'
import { Types } from 'mongoose'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

export default function Home({ params }: { params: { archiveId: string } }) {
	const router = useRouter()
	const pathname = usePathname() ?? ''

	// @ts-ignore
	const { data, isLoading, error } = useArchiveSongs(params.archiveId) || {}
	const [showToast, setShowToast] = React.useState(true)

	const [pdfDialogParams, setPdfDialogParams] = React.useState<PdfFileViewParams | null>(null)

	const fileMap = useFileMapValue()
	const [, setSongView] = useSongView()

	const songs = data || []
	const visibleSongs = songs.filter((song) => !song.hide)

	const onLoadPdf = (index: number) => {
		const song = songs[index]
		const file = fileMap?.get(song?._id as unknown as Types.ObjectId)
		if (file) {
			setPdfDialogParams({ fileUrl: URL.createObjectURL(file), songs, index: songs?.findIndex((s) => s._id === song._id) || 0, song })
		} // Song has no file, use iframe viewer
		else if (!pathname.endsWith('songview')) {
			router.push('songs/songview')
			setSongView(() => {
				return { songs: visibleSongs, index }
			})
		}
	}

	return (
		<NpMain title='Arkiston kappaleet'>
			{isLoading && <LoadingIndicator />}
			{error && showToast && <NpToast onClose={() => setShowToast(false)}>{JSON.stringify(error)}</NpToast>}
			{songs && !pdfDialogParams && (
				<div className='flex flex-col gap-4 w-full items-start'>
					<NpBackButton onClick={() => router.back()} />

					{!isLoading && <ArchiveSongList songs={songs} onLoadPdf={onLoadPdf} archiveId={params.archiveId} songCardType='basic' />}
				</div>
			)}
			{pdfDialogParams && (
				<PdfFileView
					pdfDialogParams={pdfDialogParams}
					onLoadPdf={onLoadPdf}
					onClose={() => setPdfDialogParams(null)}
				/>
			)}
		</NpMain>
	)
}
