'use client'

import { NpBackButton } from '@/components/NpBackButton'
import { NpButton } from '@/components/NpButton'
import { NpMain } from '@/components/NpMain'
import { NpSubTitle } from '@/components/NpTitle'
import { NpToast } from '@/components/NpToast'
import { SongLite } from '@/models/song'
import { useArchive, useArchiveSongs, useArchiveUser } from '@/models/swrApi'
import { add } from '@dnd-kit/utilities'
import { drive } from 'googleapis/build/src/apis/drive'
import { set } from 'mongoose'
import { useRouter } from 'next/navigation'
import React from 'react'
import { ManageFilesSection } from './ManageFilesSection'
import { NewFilesSection } from './NewFilesSection'

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
									Lataa ajantasainen tiedostolista ja näe uudet tiedostot. Lisää tiedostot arkistoon joko kappalelistauksessa näkyvänä tai
									piilotettuna.
								</p>
								<NpButton onClick={loadDriveFolder}>Uudet tiedostot</NpButton>

								<p className='pt-8'>Muokkaa arkiston tiedostojen näkyvyyttä kappalelistauksessa.</p>
								<NpButton onClick={() => setSection('ARCHIVE')}>Näkyvyys</NpButton>
							</div>
						)}
						{section === 'DRIVE' && <NewFilesSection newDriveSongs={newDriveSongs} setSection={setSection} archive={archive} />}
						{section === 'ARCHIVE' && <ManageFilesSection songs={songs} setSection={setSection} archiveId={archiveId} />}
					</div>
				</React.Fragment>
			)}
		</NpMain>
	)
}
