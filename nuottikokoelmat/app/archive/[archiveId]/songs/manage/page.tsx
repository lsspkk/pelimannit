'use client'

import { NpBackButton } from '@/components/NpBackButton'
import { NpButton } from '@/components/NpButton'
import { NpInput } from '@/components/NpInput'
import { NpMain } from '@/components/NpMain'
import { NpSubTitle } from '@/components/NpTitle'
import { NpToast } from '@/components/NpToast'
import { SongLite } from '@/models/song'
import { useArchive, useArchiveSongs } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { NewDriveSongsSection } from './NewDriveSongsSection'
import { ArchiveSongsSection } from './ArchiveSongsSection'

export type ManagingSection = 'NONE' | 'DRIVE' | 'ARCHIVE'

export default function Home({ params }: { params: { archiveId: string } }) {
  const router = useRouter()

  const { archiveId } = params || {}
  // @ts-ignore
  const { data: archive, isLoading: isArchiveLoading } = useArchive(archiveId) || {}
  const { data: songs, isLoading: isSongsLoading, isValidating } = useArchiveSongs(params.archiveId) || {}
  const [section, setSection] = React.useState<ManagingSection>('NONE')
  const [newDriveSongs, setNewDriveSongs] = React.useState<SongLite[]>([])
  const [errors, setErrors] = React.useState<string[]>([])
  const [folderId, setFolderId] = React.useState<string>('')
  const [folderFetchInProgress, setFolderFetchInProgress] = React.useState<boolean>(false)

  const loadDriveFolder = async () => {
    setFolderFetchInProgress(true)
    const response = await fetch(`/api/drive/folder/${folderId}`)
    if (response.ok) {
      const allDriveSongs: SongLite[] = await response.json()
      const knownPathNames = songs?.map((song) => (song.path + song.songname).normalize()) || []
      const newSongs = allDriveSongs.filter((song) => !knownPathNames.includes((song.path + song.songname).normalize()))
      console.debug({ knownPathNames, newSongs })
      setNewDriveSongs(newSongs)
      setSection('DRIVE')
    } else {
      const text = await response.text()
      setErrors([...errors, `Kansion lataus epäonnistui: ${response.status}, ${text}`])
    }
    setFolderFetchInProgress(false)
  }

  useEffect(() => {
    if (folderId.length === 0 && archive?.driveId) {
      setFolderId(archive.driveId)
    }
  }, [archive?.driveId, folderId])

  const removeError = (index: number) => {
    const newErrors = [...errors]
    newErrors.splice(index, 1)
    setErrors(newErrors)
  }

  const isLoading = isArchiveLoading || isSongsLoading || isValidating

  return (
    <NpMain title='Arkisto'>
      {isLoading && <div>Ladataan...</div>}

      {archive && songs && (
        <React.Fragment>
          <NpBackButton
            onClick={() => (section === 'NONE' ? router.push(`/archive/${archiveId}`) : setSection('NONE'))}
          />

          {errors.map((error, index) => (
            <NpToast key={`error-${index}-${error}`} onClose={() => removeError(index)}>
              {error}
            </NpToast>
          ))}

          <div className='flex gap-4 w-full items-start justify-start flex-col pb-10'>
            <div className='w-full'>
              <NpSubTitle>{archive.archivename}</NpSubTitle>
            </div>
            {section === 'NONE' && (
              <div className='flex gap-2 md:gap-4 w-full flex-col'>
                <p className='pt-8'>
                  Lataamalla ajantasainen tiedostolista ja näe mahdolliset uudet tiedostot. Lisää tiedostot arkistoon
                  joko kappalelistauksessa näkyvänä tai piilotettuna.
                </p>

                <NpInput
                  label='Google Drive -kansion ID'
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                />

                <NpButton disabled={folderId.length < 2} onClick={loadDriveFolder} inProgress={folderFetchInProgress}>
                  Tiedostolista
                </NpButton>

                <p className='pt-8'>Muokkaa arkiston tiedostojen näkyvyyttä kappalelistauksessa.</p>
                <NpButton onClick={() => setSection('ARCHIVE')}>Näkyvyys</NpButton>
              </div>
            )}
            {section === 'DRIVE' && (
              <NewDriveSongsSection newDriveSongs={newDriveSongs} setSection={setSection} archive={archive} />
            )}
            {section === 'ARCHIVE' && (
              <ArchiveSongsSection songs={songs} setSection={setSection} archiveId={archiveId} />
            )}
          </div>
        </React.Fragment>
      )}
    </NpMain>
  )
}
