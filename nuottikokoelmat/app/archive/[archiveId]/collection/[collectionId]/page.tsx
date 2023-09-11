'use client'

import { useArchiveUser, useCollection, useCollectionSongs, useIsArchiveManager } from '@/models/swrApi'
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
import { NpSubTitle, NpTitle } from '@/components/NpTitle'
import { NpButtonCard } from '@/components/NpButtonCard'
import { PdfDialog, PdfDialogParams } from '@/components/PdfDialog'
import { SpinnerInfinity } from '@/components/NpButton'

export default function Home({
  params: { archiveId, collectionId },
}: {
  params: { archiveId: string; collectionId: string }
}) {
  const router = useRouter()

  // @ts-ignore
  const { data, mutate, isLoading: isLoadingSongs, errorSongs } = useCollectionSongs(collectionId) || {}
  const { data: collection, isLoading: isLoadingCollection, error: errorCollection } = useCollection(collectionId) || {}
  const isManager = useIsArchiveManager(archiveId)

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

  const isLoading = isLoadingSongs || isLoadingCollection
  const error = errorSongs || errorCollection

  return (
    <NpMain>
      {isLoading && <div>Ladataan...</div>}
      {error && <div>Virhe: {JSON.stringify(error)}</div>}
      {collection && (
        <div className='flex flex-col gap-4 w-full items-start -mt-4'>
          <NpBackButton onClick={() => router.push(`/archive/${archiveId}`)} />

          <div className='w-full justify-between flex'>
            <div className='w-full'>
              <NpSubTitle>{collection?.collectionname}</NpSubTitle>
              <div className='text-sm mb-4'>{collection?.description}</div>
            </div>
            {isManager && (
              <div className=''>
                <NpButton
                  className='flex items-center gap-2 px-[0.5em]'
                  onClick={() => router.push(`/archive/${archiveId}/collection/${String(collection._id)}/edit`)}
                >
                  <PencilIcon className='w-6 h-6' />
                  Muokkaa
                </NpButton>
              </div>
            )}
          </div>
          {isManager && (
            <NpButton onClick={() => router.push(`/archive/${archiveId}/collection/${collectionId}/songs`)}>
              Kappalevalinnat
            </NpButton>
          )}

          <div className='flex-col w-full items-start flex'>
            {data && data.length > 0 && isManager && <DnDCollectionSongs songs={data} saveSongOrder={saveSongOrder} />}
            {data && data.length > 0 && !isManager && <CollectionSongs songs={data} />}
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
  }, [dndSongs, saveSongOrder])

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
            <DnDCollectionSongCard key={song._id} id={`${index}`} song={song} index={index} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

const CollectionSongs = ({ songs }: { songs: Song[] }) => {
  const [pdfDialogParams, setPdfDialogParams] = React.useState<PdfDialogParams | null>(null)

  const onLoadPdf = async (song: Song) => {
    const response = await fetch(`/api/archive/${song.archiveId}/song/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(song),
    })
    const blob = await response.blob()
    const fileUrl = URL.createObjectURL(blob)
    setPdfDialogParams({ fileUrl, songs, index: songs?.findIndex((s) => s._id === song._id) || 0, song })
  }

  return (
    <div className='flex flex-col gap-4 w-full items-start pb-4'>
      {!pdfDialogParams &&
        songs.map((song, index) => (
          <CollectionSongCard key={song._id} song={song} index={index} onLoadPdf={() => onLoadPdf(song)} />
        ))}
      {pdfDialogParams && (
        <PdfDialog pdfDialogParams={pdfDialogParams} onLoadPdf={onLoadPdf} onClose={() => setPdfDialogParams(null)} />
      )}
    </div>
  )
}

const CollectionSongCard = ({ song, index, onLoadPdf }: { song: Song; index: number; onLoadPdf: () => void }) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const loadPdf = () => {
    setIsLoading(true)
    onLoadPdf()
  }

  return (
    <NpButtonCard onClick={loadPdf}>
      <div className='flex-col w-1/12 flex items-center justify-center'>
        <div className='text-amber-700 text-xl -ml-2'>{index + 1}</div>
        {isLoading && (
          <SpinnerInfinity size={10} thickness={100} speed={100} color='#36ad47' secondaryColor='rgba(0, 0, 0, 0.44)' />
        )}
      </div>
      <div className='flex-col w-11/12 flex'>
        <div className='text-md'>{song.songname}</div>
        <div className='text-xs overflow-clip text-clip whitespace-nowrap'>{displayPath(song)}</div>
      </div>
    </NpButtonCard>
  )
}

const DnDCollectionSongCard = ({ song, index, id }: { song: Song; index: number; id: string }) => {
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
    <div ref={setNodeRef} className='w-full' style={style}>
      <NpButtonCard>
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
      </NpButtonCard>
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
