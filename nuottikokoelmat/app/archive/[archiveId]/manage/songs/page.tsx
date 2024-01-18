'use client'

import { NpBackButton } from '@/components/NpBackButton'
import { NpButton } from '@/components/NpButton'
import { NpMain } from '@/components/NpMain'
import { NpSubTitle } from '@/components/NpTitle'
import { NpToast } from '@/components/NpToast'
import { SongLite } from '@/models/song'
import { useArchive, useArchiveUser } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React from 'react'

export type ManagingSection = 'NONE' | 'LOGIN' | 'MANAGE'

export default function Home({ params }: { params: { archiveId: string } }) {
	const router = useRouter()

	const { archiveId } = params || {}
	// @ts-ignore
	const { data, isLoading, error } = useArchive(archiveId) || {}
	const [section, setSection] = React.useState<ManagingSection>('NONE')
	const { data: archiveUser } = useArchiveUser(archiveId)
	const [showToast, setShowToast] = React.useState(true)
	const [driveSongs, setDriveSongs] = React.useState<SongLite[]>([])

	const loadDriveFolder = async () => {
		const response = await fetch(`/api/drive/folder/${archiveId}`)
		if (response.ok) {
			const loadedDriveSongs: SongLite[] = await response.json()
			setDriveSongs(loadedDriveSongs)
		} else {
			console.error('Failed to load drive folder', response)
		}
	}

	return (
		<NpMain title='Arkisto'>
			{isLoading && <div>Ladataan...</div>}
			{error && showToast && <NpToast onClose={() => setShowToast(false)}>{JSON.stringify(error)}</NpToast>}

			{data && (
				<React.Fragment>
					<NpBackButton onClick={() => router.push(`/archive/${archiveId}`)} />

					<div className='flex gap-4 w-full items-start justify-start flex-col'>
						<div className='w-full'>
							<NpSubTitle>{data.archivename}</NpSubTitle>
							<p>
								Ylläpidä arkiston kappaleita lataamalla ajantasainen tilanne tiedostolista. Lisää kappaleita näkyväksi arkiston listauksessa
								tai jätä piilotetuiksi.
							</p>
						</div>
						<div className='flex gap-4 md:gap-8 w-full'>
							{section === 'NONE' && <NpButton onClick={loadDriveFolder}>Lue arkiston tilanne</NpButton>}
							{section === 'NONE' && (
								<NpButton
									variant='secondary'
									className='w-28'
									onClick={() => router.push(`/archive/${archiveId}/files`)}
								>
									Tiedostot
								</NpButton>
							)}
							{section === 'NONE' && archiveUser?.archiveId !== archiveId && (
								<NpButton
									variant='secondary'
									className='w-28'
									onClick={() => setSection('LOGIN')}
								>
									Ylläpito
								</NpButton>
							)}
							{section === 'NONE' && archiveUser?.archiveId === archiveId && (
								<NpButton className='' onClick={() => setSection('MANAGE')}>Asetukset</NpButton>
							)}
						</div>
					</div>
				</React.Fragment>
			)}

			{driveSongs.length > 0 && (
				<div className='flex flex-col gap-4'>
					{driveSongs.map((song) => (
						<div className='flex gap-4' key={`songlite-${song.songname + song.path}`}>
							<div className='w-1/2'>{song.songname}</div>
							<div className='w-1/2'>{song.path}</div>
						</div>
					))}
				</div>
			)}
		</NpMain>
	)
}
