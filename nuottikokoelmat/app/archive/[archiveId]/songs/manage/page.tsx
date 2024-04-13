'use client'

import { NpBackButton } from '@/components/NpBackButton'
import { NpButton } from '@/components/NpButton'
import { NpInput } from '@/components/NpInput'
import { NpMain } from '@/components/NpMain'
import { NpSubTitle } from '@/components/NpTitle'
import { NpToast } from '@/components/NpToast'
import { Archive } from '@/models/archive'
import { Song, SongLite } from '@/models/song'
import { useArchive, useArchiveSongs } from '@/models/swrApi'
import { Types } from 'mongoose'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

// show/hide archive songs
// add google drive songs to archive

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
                <p className='text-sm'>Listan lataus kestää tyypillisesti joitain sekunteja</p>

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

const NewDriveSongsSection = ({
  newDriveSongs,
  setSection,
  archive,
}: {
  newDriveSongs: SongLite[]
  setSection: (section: ManagingSection) => void
  archive: Archive
}) => {
  const [newSongs, setNewSongs] = React.useState<SongLite[]>([...newDriveSongs])
  const { mutate } = useArchiveSongs(archive._id?.toString() || '')
  const [isSaving, setIsSaving] = React.useState<boolean>(false)

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
    setIsSaving(true)
    const postSongs = newSongs.map((song) => ({ ...song, archiveId: archive._id }))
    const response = await fetch(`/api/archive/${archive._id}/manage/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postSongs),
    })
    if (response.ok) {
      setSection('NONE')
      mutate()
    } else {
      console.error('Failed to add songs', response)
    }
    setIsSaving(false)
  }

  return (
    <div className='flex flex-col gap-4 w-full'>
      <div className='w-full'>
        <NpSubTitle>Uudet tiedostot Google Drivessä</NpSubTitle>
        <p>
          Lisää uudet tiedostot arkistoon. Voit piilottaa tiedostoja, jos et halua niiden näkyvän kappalelistauksessa.
        </p>
      </div>

      {newDriveSongs.length === 0 && <div>Ei uusia kappaleita Google Drivessä</div>}

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
                <tr key={`newDrive-songs-${song.path + song.songname}`} className='text-sm'>
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
            <NpButton variant='secondary' onClick={() => setSection('NONE')}>
              Keskeytä
            </NpButton>
            <NpButton inProgress={isSaving} onClick={onAddSongs}>
              Lisää
            </NpButton>
          </div>
        </div>
      )}
    </div>
  )
}

const ArchiveSongsSection = ({
  songs,
  setSection,
  archiveId,
}: {
  songs: Song[]
  setSection: (section: ManagingSection) => void
  archiveId: string
}) => {
  const [hideSongIds, setHideSongIds] = React.useState<string[]>([])
  const [showSongIds, setShowSongIds] = React.useState<string[]>([])
  const [isSaving, setIsSaving] = React.useState<boolean>(false)
  const { mutate } = useArchiveSongs(archiveId)

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
    setIsSaving(true)

    const response = await fetch(`/api/archive/${archiveId}/songs`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hideSongIds, showSongIds }),
    })
    if (response.ok) {
      await mutate()
      setSection('NONE')
    } else {
      console.error('Failed to save song visibility changes', response)
    }
    setIsSaving(false)
  }

  const hasChanges = hideSongIds.length > 0 || showSongIds.length > 0

  return (
    <div className='flex flex-col gap-4 w-full pt-4 md:pt-12'>
      <div className='w-full pb-4'>
        <NpSubTitle>Arkiston tiedostojen näkyvyys</NpSubTitle>
        <p>Voit piilottaa arkiston tiedostoja näkymästä kappalelistauksessa.</p>
      </div>

      <table className='md:-mx-2 md:w-[110%]'>
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
                <div className='flex flex-col md:flex-row gap-1 justify-start my-2'>
                  <div className='text-sm'>
                    {song.path}
                    {song.songname}
                  </div>
                </div>
              </td>
              <td className='text-center'>
                <input
                  id={`add-drive-song-checkbox-${song._id}-index`}
                  type='checkbox'
                  checked={
                    (!showSongIds.includes(song._id.toString()) && song.hide) ||
                    hideSongIds.includes(song._id.toString())
                  }
                  onChange={(e) => onToggleHidden(song._id, e.target.checked)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className='flex flex-row gap-4 justify-end'>
        <NpButton disabled={isSaving} variant='secondary' onClick={() => setSection('NONE')}>
          Keskeytä
        </NpButton>
        <NpButton inProgress={isSaving} onClick={saveSongVisibilityChanges} disabled={!hasChanges}>
          Tallenna
        </NpButton>
      </div>
    </div>
  )
}
