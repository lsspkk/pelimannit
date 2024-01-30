'use client'
import { NpButton } from '@/components/NpButton'
import { NpSubTitle } from '@/components/NpTitle'
import { Song } from '@/models/song'
import { Types } from 'mongoose'
import React from 'react'
import { ManagingSection } from './page'

export const ManageFilesSection = (
	{ songs, setSection, archiveId }: { songs: Song[]; setSection: (section: ManagingSection) => void; archiveId: string },
) => {
	const [hideSongIds, setHideSongIds] = React.useState<string[]>([]) // songs that will be changed into hidden state
	const [showSongIds, setShowSongIds] = React.useState<string[]>([]) // songs that will be changed into visible state
	const [isSaving, setIsSaving] = React.useState<boolean>(false)

	const onToggleHidden = (objectId: Types.ObjectId, newHide: boolean, originalHide: boolean) => {
		const id = objectId.toString()

		if (originalHide) { // was hidden, control if the song should be shown
			if (newHide) {
				setShowSongIds(showSongIds.filter((showId) => showId !== id))
			} else {
				setShowSongIds([...showSongIds, id])
			}
		}
		if (!originalHide) { // was visible, control if the song should be hidden
			if (newHide) {
				setHideSongIds([...hideSongIds, id])
			} else {
				setHideSongIds(hideSongIds.filter((hideId) => hideId !== id))
			}
		}
	}

	const saveSongVisibilityChanges = async () => {
		setIsSaving(true)
		const hideSet = new Set(hideSongIds)
		const showSet = new Set(showSongIds)

		const patchSongs = songs.filter((song) => hideSet.has(song._id.toString()) || showSet.has(song._id.toString())).map((song) => ({
			...song,
			hide: hideSet.has(song._id.toString()),
			hideDate: hideSet.has(song._id.toString()) ? new Date() : undefined,
		}))

		const response = await fetch(`/api/archive/${archiveId}/songs`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(patchSongs),
		})
		if (response.ok) {
			setSection('NONE')
		} else {
			console.error('Failed to save song visibility changes', response)
		}
		setIsSaving(false)
	}

	const hasChanges = hideSongIds.length > 0 || showSongIds.length > 0

	return (
		<div className='flex flex-col gap-4 w-full pt-12 md:pt-24'>
			<div className='w-full'>
				<NpSubTitle>Arkiston tiedostojen näkyvyys</NpSubTitle>
				<p>Voit piilottaa arkiston tiedostoja näkymästä kappalelistauksessa.</p>
			</div>

			<NpButton className='w-28 mt-12 self-end' onClick={() => setSection('NONE')}>Takaisin</NpButton>

			<table>
				<thead>
					<tr>
						<th className='text-left w-10/12'>Kappale</th>
						<th className='text-left w-2/12'>Piilotettu</th>
					</tr>
				</thead>
				<tbody>
					{songs.map((song) => {
						const checked = !showSongIds.includes(song._id.toString()) && (song.hide ?? hideSongIds.includes(song._id.toString()))
						return (
							<tr key={`archivesongs-section-${song._id}`} className=''>
								<td>
									<div className='flex flex-col gap-1 justify-start my-2'>
										<div className='text-sm'>{song.path}</div>
										<div className='text-sm'>{song.songname}</div>
									</div>
								</td>
								<td className='text-center'>
									c: {checked ? 'true' : 'false'}
									<input
										id={`add-drive-song-checkbox-${song._id}-index`}
										type='checkbox'
										checked={checked}
										onChange={(e) => onToggleHidden(song._id, !checked, song.hide || false)}
									/>
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>

			<div className='flex flex-row gap-4 justify-end'>
				<NpButton disabled={isSaving} variant='secondary' onClick={() => setSection('NONE')}>Takaisin</NpButton>
				<NpButton inProgress={isSaving} onClick={saveSongVisibilityChanges} disabled={!hasChanges}>Tallenna</NpButton>
			</div>
		</div>
	)
}
