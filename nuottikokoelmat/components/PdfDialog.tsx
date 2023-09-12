'use client'
import React from 'react'
import { NpButton } from '@/components/NpButton'
import { ScrollMode, SpecialZoomLevel, Viewer, Worker } from '@react-pdf-viewer/core'
import { version } from 'pdfjs-dist'
import { Song } from '@/models/song'
import { NpBackButton } from './NpBackButton'

export const WorkerUrl = new URL(
  `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`,
  import.meta.url
).toString()

export type PdfDialogParams = {
  fileUrl: string
  songs?: Song[]
  index: number
  song?: Song
}

export const PdfDialog = ({
  pdfDialogParams,
  onClose,
  onLoadPdf,
}: {
  onLoadPdf: (song: Song) => Promise<void>
  pdfDialogParams: PdfDialogParams
  onClose: () => void
}) => {
  const [inProgress, setInProgress] = React.useState<'NEXT' | 'PREVIOUS' | 'NONE'>('NONE')
  const { fileUrl, songs, index, song } = pdfDialogParams

  const hasNext = songs && index < songs.length - 1
  const hasPrevious = songs && index > 0

  const onNext = () => {
    if (hasNext && songs) {
      setInProgress('NEXT')
      onLoadPdf(songs[index + 1])
      setInProgress('NONE')
    }
  }
  const onPrevious = () => {
    if (hasPrevious) {
      setInProgress('PREVIOUS')
      onLoadPdf(songs[index - 1])
      setInProgress('NONE')
    }
  }

  return (
    <div className='fixed top-0 left-0 w-full h-full bg-white overflow-y-scroll overflow-x-hidden'>
      <NpBackButton onClick={onClose} />

      {songs && (
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
      )}

      <div className='w-[112%] min-h-full ml-[-4%] mr-[-8%] z-0 overflow-y-scroll'>
        <Worker workerUrl={WorkerUrl}>
          <Viewer fileUrl={fileUrl} defaultScale={SpecialZoomLevel.PageWidth} scrollMode={ScrollMode.Vertical} />
        </Worker>
      </div>
    </div>
  )
}

const IconPrevious = () => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' className='w-6 h-6'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
  </svg>
)

const IconNext = () => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' className='w-6 h-6'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
  </svg>
)
