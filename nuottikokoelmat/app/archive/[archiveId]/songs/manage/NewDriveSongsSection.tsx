'use client'
import { NpButton } from '@/components/NpButton'
import { NpSubTitle } from '@/components/NpTitle'
import { Archive } from '@/models/archive'
import { SongLite } from '@/models/song'
import { useArchiveSongs } from '@/models/swrApi'
import React from 'react'
import { ManagingSection } from './page'

export const NewDriveSongsSection = ({
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
    const response = await fetch(`/api/song/array`, {
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
