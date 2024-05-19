'use client'
import { NpButtonCard } from '@/components/NpButtonCard'
import { Spinner } from '@/components/Spinner'
import { Song } from '@/models/song'
import React from 'react'
import { displayPath } from '../app/archive/[archiveId]/collection/[collectionId]/displayPath'

export const BasicSongCard = (
	{ song, index, onLoadPdf, children }: { song: Song; index: number; onLoadPdf: (index: number) => void; children?: React.ReactNode },
) => {
	const [isLoading, setIsLoading] = React.useState(false)
	const loadPdf = () => {
		setIsLoading(true)
		onLoadPdf(index)
		setIsLoading(false)
	}

	return (
		<NpButtonCard onClick={loadPdf}>
			<div className='flex-col w-1/12 flex items-center justify-center'>
				<div className='text-amber-700 text-xl -ml-2'>{index + 1}</div>
				{isLoading && <Spinner speed={100} color='#36ad47' />}
			</div>
			<div className='flex-col w-11/12 flex'>
				<div className='text-md'>{song.songname}</div>
				<div className='text-xs overflow-clip text-clip whitespace-nowrap'>{displayPath(song)}</div>
			</div>
			{children}
		</NpButtonCard>
	)
}
