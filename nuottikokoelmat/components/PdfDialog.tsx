'use client'
import React from 'react'
import { ScrollMode, SpecialZoomLevel, Viewer, Worker } from '@react-pdf-viewer/core'
import { version } from 'pdfjs-dist'
import { Song } from '@/models/song'
import { NpBackButton } from './NpBackButton'
import { Types } from 'mongoose'
import { PdfSongNavigation } from './PdfSongNavigation'

export const WorkerUrl = new URL(
  `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`,
  import.meta.url
).toString()

export type PdfDialogParams = {
  fileUrl: string
  songs?: Song[]
  fileMap?: Map<Types.ObjectId, File>
  index: number
  song?: Song
}

export const PdfDialog = ({
  pdfDialogParams,
  onClose,
  onLoadPdf,
}: {
  onLoadPdf: (index: number) => void
  pdfDialogParams: PdfDialogParams
  onClose: () => void
}) => {
  const { fileUrl, fileMap, songs, index, song } = pdfDialogParams

  const file = fileMap?.get(song?._id as unknown as Types.ObjectId)
  const currentUrl = file ? URL.createObjectURL(file) : fileUrl

  return (
    <div className='fixed top-0 left-0 w-full h-full bg-white overflow-y-scroll overflow-x-hidden'>
      <NpBackButton onClick={onClose} className='z-10' />

      {songs && <PdfSongNavigation songs={songs} index={index} onLoadPdf={onLoadPdf} />}

      <div className='w-[112%] min-h-full ml-[-4%] mr-[-8%] z-0 overflow-y-scroll'>
        <Worker workerUrl={WorkerUrl}>
          <Viewer fileUrl={currentUrl} defaultScale={SpecialZoomLevel.PageWidth} scrollMode={ScrollMode.Vertical} />
        </Worker>
      </div>
    </div>
  )
}

export const IconPrevious = () => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' className='w-6 h-6'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
  </svg>
)

export const IconNext = () => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' className='w-6 h-6'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
  </svg>
)
