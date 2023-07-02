'use client'

import { useCollection, useCollectionSongs } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React from 'react'
import { NpMain } from '@/components/NpMain'
import { NpButtonCard } from '@/components/NpButtonCard'
import { Song } from '@/models/song'
import { NpButton } from '@/components/NpButton'

export default function Home({
  params: { archiveId, collectionId },
}: {
  params: { archiveId: string; collectionId: string }
}) {
  const router = useRouter()

  // @ts-ignore
  const { data, isLoading, error } = useCollectionSongs(collectionId) || {}
  const { data: collection, isLoading: collectionIsLoading, error: collectionError } = useCollection(collectionId) || {}
  // lataa kokoelmat... :)

  return (
    <NpMain>
      {isLoading && <div>Ladataan...</div>}
      {error && <div>Virhe: {JSON.stringify(error)}</div>}
      {collection && (
        <div className='flex flex-col gap-4 w-full items-start -mt-4'>
          <div className='flex-col w-full items-start flex'>
            <div className='text-2xl'>{collection?.collectionname}</div>
            <div className='text-sm mb-4'>{collection?.description}</div>
            <NpButton onClick={() => router.push(`/archive/${archiveId}/collection/${collectionId}/songs`)}>
              Valinnat
            </NpButton>
          </div>

          <div className='flex-col w-full items-start'>
            {data?.map((song) => (
              <ArchiveSongCard key={song._id} song={song} />
            ))}
            {data?.length === 0 && <div className='text-xs'>Ei valittuja kappaleita</div>}
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
        <div className='text-2xl'>{song.songname}</div>
        <div className='text-sm'>{displayPath(song)}</div>
      </div>
    </NpButtonCard>
  )
}
