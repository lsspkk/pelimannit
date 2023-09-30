'use client'
import React from 'react'
import { NpButton } from '@/components/NpButton'
import { Song } from '@/models/song'
import { IconPrevious, IconNext } from './PdfDialog'

export const PdfSongNavigation = ({
  songs,
  index,
  onLoadPdf,
}: {
  songs: Song[]
  index: number
  onLoadPdf: (index: number) => void
}) => {
  const [inProgress, setInProgress] = React.useState<'NEXT' | 'PREVIOUS' | 'NONE'>('NONE')
  const song = songs[index]
  const hasNext = songs && index < songs.length - 1
  const hasPrevious = songs && index > 0

  const onNext = () => {
    if (hasNext) {
      setInProgress('NEXT')
      onLoadPdf(index + 1)
      setInProgress('NONE')
    }
  }
  const onPrevious = () => {
    if (hasPrevious) {
      setInProgress('PREVIOUS')
      onLoadPdf(index - 1)
      setInProgress('NONE')
    }
  }

  return (
    <div className=''>
      <div className='fixed bottom-1 w-full justify-center text-xs text-center text-emerald-700 opacity-40 flex gap-4 z-30'>
        <div>
          {index + 1}/{songs?.length}
        </div>
        <div> {song?.songname}</div>
      </div>
      <div className='fixed left-0 bottom-0 z-30'>
        <NpButton
          className='py-4 rounded-lg opacity-20'
          onClick={onPrevious}
          disabled={!hasPrevious}
          inProgress={inProgress === 'PREVIOUS'}
        >
          <IconPrevious />
        </NpButton>
      </div>
      <div className='fixed right-0 bottom-0 z-30'>
        <NpButton
          className='py-4 rounded-lg opacity-20'
          onClick={onNext}
          disabled={!hasNext}
          inProgress={inProgress === 'NEXT'}
        >
          <IconNext />
        </NpButton>
      </div>
    </div>
  )
}
