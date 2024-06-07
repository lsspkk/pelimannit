'use client'
import { SortSettingsDialog } from '@/components/archiveSongList/SortSettingsDialog'
import { useSortSettings } from '@/components/archiveSongList/useSortSettings'
import { SortSettingsIcon } from '@/components/icons//SortSettingsIcon'
import { NpButton } from '@/components/NpButton'
import { Choice } from '@/models/choice'
import { Song } from '@/models/song'
import React from 'react'
import { BasicSongCard } from '../BasicSongCard'
import { ChoiceSongCard } from '../ChoiceSongCard'

export const ArchiveSongList = (
	{ songs, onLoadPdf, archiveId, songCardType, onChoiceClick, choices }: {
		songs: Song[]
		onLoadPdf: (index: number) => void
		archiveId: string
		songCardType: 'basic' | 'choice'
		onChoiceClick?: (song: Song, choice?: Choice) => void
		choices?: Choice[]
	},
) => {
	const [showControls, setShowControls] = React.useState(false)
	const { sortSettings, updateSortSettings, sortedSongs } = useSortSettings({ archiveId, songs })

	return (
		<div className='flex flex-col gap-4 w-full items-start'>
			<div className=' self-end -mt-2 mb-2'>
				<NpButton className='rounded-full fixed right-0' onClick={() => setShowControls(true)}>
					<SortSettingsIcon />
				</NpButton>
			</div>
			{showControls && (
				<SortSettingsDialog onClose={() => setShowControls(false)} sortSettings={sortSettings} updateSortSettings={updateSortSettings} />
			)}
			<div className='flex-col w-full items-start flex gap-2 -mt-4 mb-4'>
				{sortedSongs.map((song, index) => (
					<React.Fragment key={String(song._id)}>
						{songCardType === 'basic' && (
							<BasicSongCard
								song={song}
								onLoadPdf={() =>
									onLoadPdf(sortedSongs.findIndex((s) => s._id === song._id))}
								index={index}
							>
								{sortSettings.year === 'NONE' && isFirstAlphabet(sortedSongs, index) && (
									<FirstAlphabet>{song.songname.charAt(0).toLocaleUpperCase()}</FirstAlphabet>
								)}
							</BasicSongCard>
						)}

						{songCardType === 'choice' && onChoiceClick && (
							<ChoiceSongCard
								song={song}
								onChoiceClick={onChoiceClick}
								onLoadPdf={() => onLoadPdf(sortedSongs.findIndex((s) => s._id === song._id))}
								choice={choices?.find((c) => c.songId === song._id)}
							>
								{sortSettings.year === 'NONE' && isFirstAlphabet(sortedSongs, index) && (
									<FirstAlphabet>{song.songname.charAt(0)}</FirstAlphabet>
								)}
							</ChoiceSongCard>
						)}
					</React.Fragment>
				))}
			</div>
		</div>
	)
}

export const FirstAlphabet = ({ children }: { children: React.ReactNode }) => (
	<div className='text-2xl font-bold text-gray-500'>{children}</div>
)
export const isFirstAlphabet = (songs: Song[], index: number) => {
	const firstLetter = songs[index].songname.charAt(0)
	const isLetter = /[a-zåäö]/i.exec(firstLetter)
	if (!isLetter) {
		return false
	}

	if (index === 0) {
		return true
	}
	const previousFirstLetter = songs[index - 1].songname.charAt(0)
	return previousFirstLetter.toLocaleLowerCase() !== firstLetter.toLocaleLowerCase()
}
