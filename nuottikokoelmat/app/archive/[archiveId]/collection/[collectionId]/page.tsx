'use client'

import { useCollection, useCollectionSongs } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { NpMain } from '@/components/NpMain'
import { Song } from '@/models/song'
import { ChoiceOrder } from '@/models/choice'
import { NpButton } from '@/components/NpButton'
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { NpBackButton } from '@/components/NpBackButton'
import { NpIconButton } from '@/components/NpIconButton'
import { PencilIcon } from '@/components/icons/PencilIcon'

export default function Home({
  params: { archiveId, collectionId },
}: {
  params: { archiveId: string; collectionId: string }
}) {
  const router = useRouter()

  // @ts-ignore
  const { data, mutate, isLoading, error } = useCollectionSongs(collectionId) || {}
  const { data: collection, isLoading: collectionIsLoading, error: collectionError } = useCollection(collectionId) || {}
  // lataa kokoelmat... :)

  const saveSongOrder = async (orderedSongs: ChoiceOrder[]) => {
    const res = await fetch(`/api/collection/${collectionId}/choice/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderedSongs),
    })
    if (!res.ok) {
      throw new Error('Failed to save song order')
    } else {
      mutate()
    }
  }

  return (
    <NpMain>
      {isLoading && <div>Ladataan...</div>}
      {error && <div>Virhe: {JSON.stringify(error)}</div>}
      {collection && (
        <div className='flex flex-col gap-4 w-full items-start -mt-4'>
          <NpBackButton onClick={() => router.push(`/archive/${archiveId}`)} />

          <div className='w-full justify-between flex'>
            <div className='w-full'>
              <div className='text-2xl'>{collection?.collectionname}</div>
              <div className='text-sm mb-4'>{collection?.description}</div>
            </div>
            <div className=''>
              <NpIconButton
                className='h-10 w-10 rounded-full pl-2 border  shadow-md'
                onClick={() => router.push(`/archive/${archiveId}/collection/${String(collection._id)}/edit`)}
              >
                <PencilIcon className='w-6 h-6' />
              </NpIconButton>
            </div>
          </div>
          <NpButton onClick={() => router.push(`/archive/${archiveId}/collection/${collectionId}/songs`)}>
            Kappalevalinnat
          </NpButton>

          <div className='flex-col w-full items-start flex'>
            {data && data.length > 0 && <DnDCollectionSongs songs={data} saveSongOrder={saveSongOrder} />}
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

const DnDCollectionSongs = ({
  songs,
  saveSongOrder,
}: {
  songs: Song[]
  saveSongOrder: (orderedSongs: ChoiceOrder[]) => Promise<void>
}) => {
  const [dndSongs, setDndSongs] = React.useState(songs)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor)
  )

  useEffect(() => {
    void saveSongOrder(dndSongs.map((s, index) => ({ songId: s._id, index })))
  }, [dndSongs])

  const onDragEnd = (event: { active: any; over: any }) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setDndSongs((items) => {
        const oldIndex = active.id as number
        const newIndex = over.id as number
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <DndContext onDragEnd={onDragEnd} sensors={sensors}>
      <SortableContext items={dndSongs.map((song, index) => `${index}`)} strategy={verticalListSortingStrategy}>
        <div className='flex flex-col gap-4 w-full items-start'>
          {dndSongs.map((song, index) => (
            <CollectionSongCard key={song._id} id={`${index}`} song={song} index={index} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

const CollectionSongCard = ({ song, index, id }: { song: Song; index: number; id: string }) => {
  const { listeners, setNodeRef, transform, transition } = useSortable({ id })
  const router = useRouter()

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        background: 'rgba(235, 235, 235, 0.9)',
      }
    : undefined
  return (
    <div ref={setNodeRef} className={`rounded-sm shadow-md p-2 flex border border-cyan-600 w-full`} style={style}>
      <div className='flex-col w-10/12 flex' onClick={() => router.push(song.url)}>
        <div className='text-md'>{song.songname}</div>
        <div className='text-xs overflow-clip text-clip whitespace-nowrap'>{displayPath(song)}</div>
      </div>
      <div className='flex-col w-2/12 items-end flex justify-center' {...listeners}>
        <div className='flex flex-col items-center justify-center'>
          <div className='text-xs '>{index + 1}</div>
          <DragIcon />
        </div>
      </div>
    </div>
  )
}

// react svg drag and drop icon
const DragIcon = () => (
  <svg
    className='w-6 h-6'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden='true'
  >
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 4h18M3 10h18M3' />
  </svg>
)
