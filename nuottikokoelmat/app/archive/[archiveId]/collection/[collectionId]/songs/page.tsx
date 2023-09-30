'use client'

import { useCollectionChoices, useArchiveSongs, useCollectionSongs } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React from 'react'
import { NpMain } from '@/components/NpMain'
import { NpButtonCard } from '@/components/NpButtonCard'
import { Song } from '@/models/song'
import { Choice } from '@/models/choice'
import { addChoice, removeChoice } from '@/models/api'
import { Types } from 'mongoose'
import { NpTitle } from '@/components/NpTitle'
import { NpBackButton } from '@/components/NpBackButton'
import { NpIconButton } from '@/components/NpIconButton'

export default function Home({
  params: { archiveId, collectionId },
}: {
  params: { archiveId: string; collectionId: string }
}) {
  const router = useRouter()

  // @ts-ignore
  const { data: choices, mutate, isLoading: cIsLoading, error: cError } = useCollectionChoices(collectionId) || {}
  const { data: collectionSongs, mutate: mutateCollectionSongs } = useCollectionSongs(collectionId) || {}

  // @ts-ignore
  const { data: songs, isLoading: aIsLoading, error: aError } = useArchiveSongs(archiveId) || {}

  const isLoading = cIsLoading || aIsLoading
  const error = cError || aError

  const onChoiceClick = async (song: Song, choice?: Choice) => {
    if (choice) {
      // remove choice
      await removeChoice(choice._id)
      mutate(choices?.filter((c) => c._id !== choice._id))
      mutateCollectionSongs(collectionSongs?.filter((s) => s._id !== song._id))
    } else {
      // add choice
      const newChoice = await addChoice(collectionId as unknown as Types.ObjectId, song._id)
      mutate([...(choices || []), newChoice])
      mutateCollectionSongs([...(collectionSongs || []), song])
    }
  }
  return (
    <NpMain>
      {isLoading && <div>Ladataan...</div>}
      {cError && <div>Virhe kokoelman kappaleiden lataamisessa: {JSON.stringify(cError)}</div>}
      {aError && <div>Virhe arkiston kappaleiden lataamisessa: {JSON.stringify(aError)}</div>}

      {songs && (
        <div className='flex flex-col gap-4 w-full items-start pb-4'>
          <NpBackButton onClick={() => router.push(`/archive/${archiveId}/collection/${collectionId}`)} />
          <div className='flex-col w-full items-start flex gap-1 -mt-4 mb-4'>
            <NpTitle>Kappalevalinnat</NpTitle>
            {songs?.map((song) => (
              <ChoiceSongCard
                key={song._id.toString()}
                song={song}
                choice={choices?.find((c) => c.songId === song._id)}
                onChoiceClick={onChoiceClick}
              />
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

const ChoiceSongCard = ({
  song,
  choice,
  onChoiceClick,
}: {
  song: Song
  choice?: Choice
  onChoiceClick: (song: Song, choice?: Choice) => void
}) => {
  return (
    <NpButtonCard>
      <div className='w-10/12 justify-self-start whitespace-nowrap'>
        <div className='text-md'>{song.songname}</div>
        <div className='text-xs overflow-x-clip text-clip'>{displayPath(song)}</div>
      </div>
      <div className='2/12 justify-end flex justify-self-end flex-row w-full'>
        <NpIconButton onClick={() => onChoiceClick(song, choice)}>
          {choice ? <Star className='text-yellow-500' fill='#ffaa00' /> : <Star />}
        </NpIconButton>
      </div>
    </NpButtonCard>
  )
}

const Star = ({
  fill = 'none',
  stroke = 'currentColor',
  className = '',
}: {
  fill?: string
  stroke?: string
  className?: string
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={`h-6 w-6 -my:2${className}}`}
      fill={fill}
      viewBox='0 0 47.94 47.94'
      stroke={stroke}
    >
      <path
        d='M26.285,2.486l5.407,10.956c0.376,0.762,1.103,1.29,1.944,1.412l12.091,1.757
	c2.118,0.308,2.963,2.91,1.431,4.403l-8.749,8.528c-0.608,0.593-0.886,1.448-0.742,2.285l2.065,12.042
	c0.362,2.109-1.852,3.717-3.746,2.722l-10.814-5.685c-0.752-0.395-1.651-0.395-2.403,0l-10.814,5.685
	c-1.894,0.996-4.108-0.613-3.746-2.722l2.065-12.042c0.144-0.837-0.134-1.692-0.742-2.285l-8.749-8.528
	c-1.532-1.494-0.687-4.096,1.431-4.403l12.091-1.757c0.841-0.122,1.568-0.65,1.944-1.412l5.407-10.956
	C22.602,0.567,25.338,0.567,26.285,2.486z'
      />
    </svg>
  )
}
