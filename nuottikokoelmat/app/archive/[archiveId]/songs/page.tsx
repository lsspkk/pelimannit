'use client'

import { useArchiveSongs } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React from 'react'
import { NpMain } from '@/components/NpMain'
import { NpButtonCard } from '@/components/NpButtonCard'
import { Song } from '@/models/song'
import { on } from 'events'
import { NpBackButton } from '../../../../components/NpBackButton'

export default function Home({ params }: { params: { archiveId: string } }) {
  const router = useRouter()

  // @ts-ignore
  const { data, isLoading, error } = useArchiveSongs(params.archiveId) || {}

  // lataa kokoelmat... :)

  return (
    <NpMain>
      {isLoading && <div>Ladataan...</div>}
      {error && <div>Virhe: {JSON.stringify(error)}</div>}
      {data && (
        <div className='flex flex-col gap-4 w-full items-start'>
          <NpBackButton onClick={() => router.push(`/archive/${params.archiveId}`)} />

          <div className='flex-col w-full items-start flex gap-2 -mt-4 mb-4'>
            <div>Arkiston kappaleet</div>
            {data?.map((song) => (
              <ArchiveSongCard key={song._id} song={song} />
            ))}
          </div>
        </div>
      )}
    </NpMain>
  )
}

function displayPath(song: Song): String {
  if (!song.path || song.path.length === 0) {
    return ''
  }
  let noPrefix = song.path.startsWith('/') ? song.path.substring(1) : song.path
  let noSuffix = noPrefix.endsWith('/') ? noPrefix.substring(0, noPrefix.length - 1) : noPrefix

  return noSuffix.replaceAll('/', ' - ')
}

const ArchiveSongCard = ({ song }: { song: Song }) => {
  const router = useRouter()

  return (
    <NpButtonCard onClick={() => router.push(song.url)}>
      <div className='flex-col'>
        <div className='text-lg'>{song.songname}</div>
        <div className='text-xs'>{displayPath(song)}</div>
      </div>
    </NpButtonCard>
  )
}
