'use client'
import { useRouter } from 'next/navigation'
import React from 'react'
import { Song } from '@/models/song'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { NpButtonCard } from '@/components/NpButtonCard'
import { DragIcon } from './DragIcon'
import { displayPath } from './displayPath'

export const DnDSongCard = ({ song, index, id }: { song: Song; index: number; id: string }) => {
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
