'use client'

import { useArchiveSongs } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React from 'react'
import { NpMain } from '@/components/NpMain'
import { NpBackButton } from '@/components/NpBackButton'
import { PdfDialog, PdfDialogParams } from '@/components/PdfDialog'
import { NpToast } from '@/components/NpToast'
import { useFileMapValue } from '@/models/fileContext'
import { Types } from 'mongoose'
import { BasicSongCard } from '../collection/[collectionId]/BasicSongCard'
import { PdfIframe } from '../../../../components/PdfIframe'

export default function Home({ params }: { params: { archiveId: string } }) {
  const router = useRouter()

  // @ts-ignore
  const { data, isLoading, error } = useArchiveSongs(params.archiveId) || {}
  const [loadPdfError, setLoadPdfError] = React.useState<string | null>(null)
  const [showToast, setShowToast] = React.useState(true)

  const [pdfDialogParams, setPdfDialogParams] = React.useState<PdfDialogParams | null>(null)

  const fileMap = useFileMapValue()
  const [iframeIndex, setIframeIndex] = React.useState<number | null>(null)
  const songs = data || []

  const onLoadPdf = (index: number) => {
    const song = songs[index]
    const file = fileMap?.get(song?._id as unknown as Types.ObjectId)
    if (file) {
      setPdfDialogParams({
        fileUrl: URL.createObjectURL(file),
        songs,
        index: songs?.findIndex((s) => s._id === song._id) || 0,
        song,
      })
      return
    }
    setIframeIndex(index)
  }
  const showIframe = iframeIndex !== null

  return (
    <NpMain>
      {isLoading && <div>Ladataan...</div>}
      {error && showToast && <NpToast onClose={() => setShowToast(false)}> {JSON.stringify(error)}</NpToast>}
      {loadPdfError && <NpToast onClose={() => setLoadPdfError(null)}> {loadPdfError}</NpToast>}
      {songs && !pdfDialogParams && !showIframe && (
        <div className='flex flex-col gap-4 w-full items-start'>
          <NpBackButton onClick={() => router.push(`/archive/${params.archiveId}`)} />

          <div className='flex-col w-full items-start flex gap-2 -mt-4 mb-4'>
            <div>Arkiston kappaleet</div>
            {songs?.map((song, index) => (
              <BasicSongCard key={String(song._id)} song={song} onLoadPdf={onLoadPdf} index={index} />
            ))}
          </div>
        </div>
      )}
      {pdfDialogParams && (
        <PdfDialog pdfDialogParams={pdfDialogParams} onLoadPdf={onLoadPdf} onClose={() => setPdfDialogParams(null)} />
      )}
      {showIframe && (
        <PdfIframe iframeIndex={iframeIndex} setIframeIndex={setIframeIndex} songs={songs} onLoadPdf={onLoadPdf} />
      )}
    </NpMain>
  )
}
