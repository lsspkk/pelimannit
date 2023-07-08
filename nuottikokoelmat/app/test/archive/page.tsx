'use client'

import { Archive } from '@/models/archive'
import { useArchiveSongs } from '@/models/swrApi'
import React, { useState } from 'react'
import mongoose from 'mongoose'
import { Song, SongNoArchiveId } from '@/models/song'
import { NpSubTitle, NpTitle } from '@/components/NpTitle'
import { NpButton } from '@/components/NpButton'
import { NpInput } from '@/components/NpInput'
import { NpTextArea } from '@/components/NpTextarea'

export default function Home() {
  const [archive, setArchive] = useState<Archive | null>(null)
  const [searchName, setSearchName] = useState<string>('')
  const [createPassword, setCreatePassword] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [songsJson, setSongsJson] = useState<string>('')

  const searchArchive = async () => {
    const response = await fetch('/api/archive/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ archivename: searchName }),
    })
    try {
      const data = await response.json()
      console.log(data)
      setArchive(data[0])
    } catch (error) {
      console.log(error)
    }
  }

  const saveSongs = async (id: string) => {
    const songs: Song[] = JSON.parse(songsJson).map((s: SongNoArchiveId) => ({
      ...s,
      archiveId: id as unknown as mongoose.Types.ObjectId,
    }))
    const response = await fetch('/api/song/array', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(songs),
    })
    if (response.ok) {
      setMessage('Kappaleet tallennettu')
    } else {
      setMessage('Kappaleiden tallennus epäonnistui')
    }
    setTimeout(() => setMessage(''), 3000)
  }

  const saveArchive = async () => {
    const newArchive: Archive & { createPassword: string } = {
      archivename: searchName,
      created: new Date(),
      modified: new Date(),
      createPassword: createPassword,
    }
    const response = await fetch('/api/archive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newArchive),
    })
    const data = await response.json()

    if (response.ok && data) {
      setArchive(() => data as unknown as Archive)
      setMessage('Arkisto luotu')
    } else {
      setMessage('Arkiston luonti epäonnistui')
    }
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <main className='flex flex-col items-center p-2 gap-4 h-full justify-start h-screen'>
      <div className='justify-start items-center gap-4 flex-col flex'>
        <NpTitle>Testi</NpTitle>
        {message && <div className='my-5'>{message}</div>}
        <NpInput label='Arkiston nimi' value={searchName} onChange={(e) => setSearchName(e.target.value)} />
        <NpButton onClick={searchArchive}>Hae</NpButton>

        <NpSubTitle>Arkiston luonti</NpSubTitle>
        <NpInput label='Luonnin salasana' value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} />
        <NpButton onClick={saveArchive}>Luo arkisto</NpButton>

        {archive && (
          <div className='flex-col justify-between w-full gap-2'>
            <NpSubTitle>Kappaleiden tallennus</NpSubTitle>
            <NpTextArea
              label='KappaleetJSON'
              value={songsJson}
              onChange={(e) => setSongsJson(e.target.value)}
              placeholder='Copy pastaa tähän kappaleiden lista'
            />
            <NpButton onClick={() => saveSongs(archive?._id)}>Tallenna kappaleet</NpButton>
          </div>
        )}
      </div>

      <div className='flex-col justify-between w-full gap-2'>
        {archive === null && <div>Ei ladattua arkistoa.</div>}
        {archive && <SimpleArchiveList archive={archive} />}
      </div>
    </main>
  )
}

const SimpleArchiveList = ({ archive }: { archive: Archive }) => {
  const { data: songs } = useArchiveSongs(String(archive._id))

  return (
    <div className='flex-col justify-between w-full gap-2'>
      <div className='gap-2 w-full flex'>
        <div className='text-lg'>Kokoelma: {archive.archivename}</div>
        <div>Luontiaika: {JSON.stringify(archive.created)}</div>
        <div>Muokkausaika: {JSON.stringify(archive.modified)}</div>
      </div>
      <div className='flex-col w-full gap-4'>
        {songs?.map((song: Song, index: number) => (
          <div key={song._id} className='flex justify-between w-full'>
            <div className='flex flex-col'>
              <a href={song.url}>
                {index + 1} {song.songname}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
