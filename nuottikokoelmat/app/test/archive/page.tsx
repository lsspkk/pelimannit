'use client'

import { Archive } from '@/models/archive'
import { useArchive, useArchiveSongs } from '@/models/swrApi'
import React, { useEffect, useState } from 'react'
import { ahjola_pelimannit_songs } from '@/data/ahjola_pelimannit_songs'
import mongoose, { set } from 'mongoose'
import { Song } from '@/models/song'
import { NpTitle } from '@/components/NpTitle'
import { NpButton } from '@/components/NpButton'

export default function Home() {
  const [archive, setArchive] = useState<Archive | null>(null)

  const { data, isLoading, error: archiveError } = useArchive('649ca3f9016f78d03b5607f4')

  const loadArchive = async () => {
    const response = await fetch('/api/archive/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ archivename: 'Ahjolan Pelimannit' }),
    })
    try {
      const data = await response.json()
      console.log(data)
      setArchive(data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    void loadArchive()
  }, [])

  const saveSongs = async (id: string) => {
    const songs: Song[] = ahjola_pelimannit_songs.map((s) => ({
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
  }

  const saveArchive = async () => {
    const newArchive: Archive = {
      archivename: 'Ahjolan Pelimannit',
      created: new Date(),
      modified: new Date(),
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
    }
  }

  return (
    <main className='flex flex-col items-center p-2 gap-4 h-full justify-start h-screen'>
      <div className='justify-start items-center gap-4 flex-col flex'>
        <NpTitle>Testitallennus, arkiston / kappaleiden luonti</NpTitle>
        <NpButton onClick={saveArchive}>Tallenna Ahjolan pelimannit -arkisto</NpButton>
        {archive && (
          <NpButton onClick={() => saveSongs('649ca3f9016f78d03b5607f4')}>
            Tallenna Ahjolan pelimannit -kappaleet
          </NpButton>
        )}
      </div>
      <div className='flex justify-between w-full flex-col'>
        {archive === null && <div>ei ahjolan kokoelmaa haulla</div>}
        {archive && <div className='pre'>haettu kokoelma: {archive._id}</div>}
      </div>

      <div className='flex-col justify-between w-full gap-2'>
        {data === null && <div>ei ahjolan kokoelmaa</div>}
        {isLoading && <div>ladataan...</div>}
        {archiveError && <div>virhe</div>}
        {data && <SimpleArchiveList archive={data} />}
      </div>
    </main>
  )
}

const SimpleArchiveList = ({ archive }: { archive: Archive }) => {
  const { data: songs } = useArchiveSongs('649ca3f9016f78d03b5607f4')

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
