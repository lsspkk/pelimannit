'use client'
import React from 'react'
import { Song } from '@/models/song'
import { NpButtonCard } from '@/components/NpButtonCard'
import { SpinnerInfinity } from '@/components/NpButton'
import { displayPath } from './displayPath'

export const BasicSongCard = ({
  song,
  index,
  onLoadPdf,
  children,
}: {
  song: Song
  index: number
  onLoadPdf: (index: number) => void
  children?: React.ReactNode
}) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const loadPdf = () => {
    setIsLoading(true)
    onLoadPdf(index)
    setIsLoading(false)
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
      {children}
    </NpButtonCard>
  )
}
