'use client'
import React from 'react'
import { NpButton } from '@/components/NpButton'
import { Song } from '@/models/song'
import { IconPrevious, IconNext } from './PdfDialog'
import { useSwipe } from './useSwipe'

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

  const onSwipe = useSwipe({ onSwipedLeft: onPrevious, onSwipedRight: onNext })

  return (
    <div {...onSwipe} className='fixed bottom-0 w-full flex justify-between z-30 items-end bg-blue-800 bg-opacity-60'>
      <NpButton
        className='px-[0.2em] py-1 rounded-lg opacity-60 border-none'
        onClick={onPrevious}
        disabled={!hasPrevious}
        inProgress={inProgress === 'PREVIOUS'}
      >
        {hasPrevious && <IconPrevious />}
      </NpButton>
      {(inProgress === 'NEXT' || inProgress === 'PREVIOUS') && (
        <div className='w-80 h-80 animate-spin rounded-full bg-green-300 opacity-60' />
      )}
      {inProgress === 'NONE' && (
        <div
          className='text-xs mx-2 text-white py-1 opacity-40 flex justify-center gap-4 z-50 w-full'
          onClick={() => {}}
        >
          <div>
            {index + 1}/{songs?.length}
          </div>
          <div> {song?.songname}</div>
        </div>
      )}
      <NpButton
        className='px-[0.2em] py-1 rounded-lg opacity-60 border-none'
        onClick={onNext}
        disabled={!hasNext}
        inProgress={inProgress === 'NEXT'}
      >
        {hasNext && <IconNext />}
      </NpButton>
    </div>
  )
}
