'use client'
import { NpButton } from '@/components/NpButton'
import { NpSubTitle } from '@/components/NpTitle'
import { Song } from '@/models/song'
import { useArchiveSongs } from '@/models/swrApi'
import { Types } from 'mongoose'
import React from 'react'
import { ManagingSection } from './page'

export const ArchiveSongsSection = ({
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

    // TODO fix this
    const patchSongs = songs.map((song) => ({
      ...song,
      hide: hideSongIds.includes(song._id.toString()) ? true : song.hide,
      hideDate: hideSongIds.includes(song._id.toString()) ? new Date() : song.hideDate,
    }))

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
