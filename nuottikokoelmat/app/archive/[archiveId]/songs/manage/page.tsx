'use client'

import { NpBackButton } from '@/components/NpBackButton'
import { NpButton } from '@/components/NpButton'
import { NpMain } from '@/components/NpMain'
import { NpSubTitle } from '@/components/NpTitle'
import { NpToast } from '@/components/NpToast'
import { Song, SongLite } from '@/models/song'
import { useArchive, useArchiveSongs, useArchiveUser } from '@/models/swrApi'
import { add } from '@dnd-kit/utilities'
import { drive } from 'googleapis/build/src/apis/drive'
import { Types } from 'mongoose'
import { useRouter } from 'next/navigation'
import React from 'react'

// show/hide archive songs
// add google drive songs to archive

export type ManagingSection = 'NONE' | 'DRIVE' | 'ARCHIVE'

export default function Home({ params }: { params: { archiveId: string } }) {
	const router = useRouter()

	const { archiveId } = params || {}
	// @ts-ignore
	const { data: archive, isLoading: isArchiveLoading } = useArchive(archiveId) || {}
	const { data: songs, isLoading: isSongsLoading } = useArchiveSongs(params.archiveId) || {}
	const [section, setSection] = React.useState<ManagingSection>('NONE')
	const { data: archiveUser } = useArchiveUser(archiveId)
	const [newDriveSongs, setNewDriveSongs] = React.useState<SongLite[]>([])

	const loadDriveFolder = async () => {
		const response = await fetch(`/api/drive/folder/${archiveId}`)
		if (response.ok) {
			const allDriveSongs: SongLite[] = await response.json()
			const knownPathNames = songs?.map((song) => (song.path + song.songname).normalize()) || []
			const newSongs = allDriveSongs.filter((song) => !knownPathNames.includes((song.path + song.songname).normalize()))
			console.debug({ knownPathNames, newSongs })
			setNewDriveSongs(newSongs)
			setSection('DRIVE')
		} else {
			console.error('Failed to load drive folder', response)
		}
	}
	const isLoading = isArchiveLoading || isSongsLoading

	return (
		<NpMain title='Arkisto'>
			{isLoading && <div>Ladataan...</div>}

			{archive && songs && (
				<React.Fragment>
					<NpBackButton onClick={() => router.push(`/archive/${archiveId}`)} />

					<div className='flex gap-4 w-full items-start justify-start flex-col pb-10'>
						<div className='w-full'>
							<NpSubTitle>{archive.archivename}</NpSubTitle>
						</div>
						{section === 'NONE' && (
							<div className='flex gap-2 md:gap-4 w-full flex-col'>
								<p className='pt-8'>
									Lataamalla ajantasainen tiedostolista ja näe mahdolliset uudet tiedostot. Lisää tiedostot arkistoon joko
									kappalelistauksessa näkyvänä tai piilotettuna.
								</p>
								<NpButton onClick={loadDriveFolder}>Tiedostolista</NpButton>

								<p className='pt-8'>Muokkaa arkiston tiedostojen näkyvyyttä kappalelistauksessa.</p>
								<NpButton onClick={() => setSection('ARCHIVE')}>Näkyvyys</NpButton>
							</div>
						)}
						{section === 'DRIVE' && <NewDriveSongsSection newDriveSongs={newDriveSongs} setSection={setSection} archiveId={archiveId} />}
						{section === 'ARCHIVE' && <ArchiveSongsSection songs={songs} setSection={setSection} archiveId={archiveId} />}
					</div>
				</React.Fragment>
			)}
		</NpMain>
	)
}

const NewDriveSongsSection = (
	{ newDriveSongs, setSection, archiveId }: {
		newDriveSongs: SongLite[]
		setSection: (section: ManagingSection) => void
		archiveId: string
	},
) => {
	const [newSongs, setNewSongs] = React.useState<SongLite[]>([...newDriveSongs])

	const onToggleHidden = (index: number) => {
		const newChanges = [...newSongs]
		newChanges[index].hide = !newChanges[index].hide
		newChanges[index].hideDate = newChanges[index].hide ? new Date() : undefined
		setNewSongs(newChanges)
	}

	const onSetAllVisible = () => {
		const newChanges = [...newSongs]
		newChanges.forEach((song) => {
			song.hide = false
			song.hideDate = undefined
		})
		setNewSongs(newChanges)
	}

	const onSetAllHidden = () => {
		const newChanges = [...newSongs]
		newChanges.forEach((song) => {
			song.hide = true
			song.hideDate = new Date()
		})
		setNewSongs(newChanges)
	}

	const onAddSongs = async () => {
		const response = await fetch(`/api/archive/${archiveId}/songs`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newSongs),
		})
		if (response.ok) {
			setSection('NONE')
		} else {
			console.error('Failed to add songs', response)
		}
	}

	return (
		<div className='flex flex-col gap-4 w-full'>
			<div className='w-full'>
				<NpSubTitle>Uudet tiedostot Google Drivessä</NpSubTitle>
				<p>Lisää uudet tiedostot arkistoon. Voit piilottaa tiedostoja, jos et halua niiden näkyvän kappalelistauksessa.</p>
			</div>

			{newDriveSongs.length === 0 && <div>Ei uusia kappaleita Google Drivessä</div>}
			<NpButton className='w-28 mb-2 self-end' onClick={() => setSection('NONE')}>Takaisin</NpButton>

			{newDriveSongs.length > 0 && (
				<div className='flex flex-col gap-4 w-full pt-6 md:pt-12'>
					<div className='flex flex-row gap-4 justify-between'>
						<NpButton onClick={onSetAllVisible}>Kaikki lisätään näkyvänä</NpButton>
						<NpButton onClick={onSetAllHidden}>Kaikki lisätään piilotettuna</NpButton>
					</div>

					<table>
						<thead>
							<tr>
								<th className='text-left w-10/12'>Tiedosto</th>
								<th className='text-left w-2/12'>Piilotetaan</th>
							</tr>
						</thead>
						<tbody>
							{newDriveSongs.map((song, index) => (
								<tr key={index} className='text-sm'>
									<td>
										<div className='flex flex-col gap-4 justify-start w-full'>
											<div className='text-xs'>{song.path}</div>
											<div className='text-xs'>{song.songname}</div>
										</div>
									</td>
									<td className='text-center'>
										<input
											id={`add-drive-song-checkbox-${song.songname}-index`}
											type='checkbox'
											checked={song.hide}
											onChange={() => onToggleHidden(index)}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					<div className='flex flex-row gap-4 justify-end'>
						<NpButton variant='secondary' onClick={() => setSection('NONE')}>Keskeytä</NpButton>
						<NpButton onClick={onAddSongs}>Lisää</NpButton>
					</div>
				</div>
			)}
		</div>
	)
}

const ArchiveSongsSection = (
	{ songs, setSection, archiveId }: { songs: Song[]; setSection: (section: ManagingSection) => void; archiveId: string },
) => {
	const visibleSongIds = new Set<string>(songs.filter((song) => !song.hide).map((song) => String(song._id)))

	const [hideSongIds, setHideSongIds] = React.useState<string[]>([])
	const [showSongIds, setShowSongIds] = React.useState<string[]>([])

	const onToggleHidden = (objectId: Types.ObjectId, hide: boolean) => {
		const id = objectId.toString()
		if (hide) {
			setHideSongIds([...hideSongIds, id])
			setShowSongIds(showSongIds.filter((showId) => showId !== id))
		} else {
			setShowSongIds([...showSongIds, id])
			setHideSongIds(hideSongIds.filter((hideId) => hideId !== id))
		}
	}

	const saveSongVisibilityChanges = async () => {
		const response = await fetch(`/api/archive/${archiveId}/songs/visibility`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ hideSongIds, showSongIds }),
		})
		if (response.ok) {
			setSection('NONE')
		} else {
			console.error('Failed to save song visibility changes', response)
		}
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
					{songs.map((song) => (
						<tr key={`archivesongs-section-${song._id}`} className=''>
							<td>
								<div className='flex flex-col gap-1 justify-start my-2'>
									<div className='text-sm'>{song.path}</div>
									<div className='text-sm'>{song.songname}</div>
								</div>
							</td>
							<td className='text-center'>
								<input
									id={`add-drive-song-checkbox-${song._id}-index`}
									type='checkbox'
									checked={song.hide || hideSongIds.includes(song._id.toString())}
									onChange={(e) => onToggleHidden(song._id, e.target.checked)}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<div className='flex flex-row gap-4 justify-end'>
				<NpButton variant='secondary' onClick={() => setSection('NONE')}>Keskeytä</NpButton>
				<NpButton onClick={saveSongVisibilityChanges} disabled={!hasChanges}>Tallenna</NpButton>
			</div>
		</div>
	)
}
