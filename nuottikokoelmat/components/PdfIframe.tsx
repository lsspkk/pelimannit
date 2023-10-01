'use client'
import React from 'react'
import { NpBackButton } from '@/components/NpBackButton'
import { PdfSongNavigation } from '@/components/PdfSongNavigation'
import { Song } from '@/models/song'

export const PdfIframe = ({
  iframeIndex,
  setIframeIndex,
  songs,
  onLoadPdf,
}: {
  iframeIndex: number
  setIframeIndex: (index: number | null) => void
  songs: Song[]
  onLoadPdf: (index: number) => void
}) => {
  const iframeUrl = songs ? songs[iframeIndex].url : null

  if (!iframeUrl) {
    return null
  }

  return (
    <div className='fixed top-0 left-0 w-full h-full bg-white overflow-y-scroll overflow-x-hidden'>
      <NpBackButton onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>
        ) =>{
          e.preventDefault()
          setIframeIndex(null)}} className='z-20'/>
      <PdfSongNavigation songs={songs || []} index={iframeIndex} onLoadPdf={onLoadPdf} />
      <iframe src={iframeUrl.replaceAll('/view?', '/preview?')} className='w-full h-full bottom-0 z-0' />
    </div>
  )
}
