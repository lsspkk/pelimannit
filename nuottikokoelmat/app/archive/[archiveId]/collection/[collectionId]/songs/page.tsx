'use client'

import { ArchiveSongList } from '@/components/archiveSongList/ArchiveSongList'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { NpBackButton } from '@/components/NpBackButton'
import { NpMain } from '@/components/NpMain'
import { NpTitle } from '@/components/NpTitle'
import { NpToast } from '@/components/NpToast'
import { addChoice, removeChoice } from '@/models/api'
import { Choice } from '@/models/choice'
import { Song } from '@/models/song'
import { useArchiveSongs, useCollectionChoices, useCollectionSongs } from '@/models/swrApi'
import { useSongView } from '@/stores/SongViewContext'
import { Types } from 'mongoose'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

export default function Home({ params: { archiveId, collectionId } }: { params: { archiveId: string; collectionId: string } }) {
	const router = useRouter()
	const pathname = usePathname() ?? ''

	// @ts-ignore
	const { data: choices, mutate, isLoading: cIsLoading, error: cError } = useCollectionChoices(collectionId) || {}
	const { data: collectionSongs, mutate: mutateCollectionSongs } = useCollectionSongs(collectionId) || {}

	// @ts-ignore
	const { data: songs, isLoading: aIsLoading, error: aError } = useArchiveSongs(archiveId) || {}

	const [, setSongView] = useSongView()
	const [showToast, setShowToast] = React.useState(true)

	const isLoading = cIsLoading || aIsLoading
	const error = cError || aError
	const visibleSongs = songs?.filter((song) => !song.hide)

	const onChoiceClick = async (song: Song, choice?: Choice) => {
		if (choice) {
			// remove choice
			await removeChoice(choice._id)
			mutate(choices?.filter((c) => c._id !== choice._id))
			mutateCollectionSongs(collectionSongs?.filter((s) => s._id !== song._id))
		} else {
			// add choice
			const newChoice = await addChoice(collectionId as unknown as Types.ObjectId, song._id)
			mutate([...(choices || []), newChoice])
			mutateCollectionSongs([...(collectionSongs || []), song])
		}
	}

	const onLoadPdf = (index: number) => {
		if (!pathname.endsWith('songview') && visibleSongs) {
			router.push('songs/songview')
			setSongView(() => {
				return { songs: visibleSongs, index }
			})
		}
	}

	return (
		<NpMain title='Kappalevalinnat'>
			{isLoading && <LoadingIndicator />}
			{showToast && error && (
				<NpToast onClose={() => setShowToast(false)}>
					{cError && <div>Virhe kokoelman kappaleiden lataamisessa: {JSON.stringify(cError)}</div>}
					{aError && <div>Virhe arkiston kappaleiden lataamisessa: {JSON.stringify(aError)}</div>}
				</NpToast>
			)}
			{visibleSongs && (
				<div className='flex flex-col gap-4 w-full items-start pb-4'>
					<NpBackButton onClick={() => router.back()} />
					<ArchiveSongList
						songs={visibleSongs}
						choices={choices || []}
						songCardType='choice'
						onChoiceClick={onChoiceClick}
						archiveId={archiveId}
						onLoadPdf={onLoadPdf}
					/>
				</div>
			)}
		</NpMain>
	)
}
