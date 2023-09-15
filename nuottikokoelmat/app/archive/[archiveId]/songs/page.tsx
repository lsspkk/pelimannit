'use client'

import { useArchiveSongs } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React from 'react'
import { NpMain } from '@/components/NpMain'
import { NpButtonCard } from '@/components/NpButtonCard'
import { Song } from '@/models/song'
import { NpBackButton } from '@/components/NpBackButton'
import { PdfDialog, PdfDialogParams } from '@/components/PdfDialog'
import { SpinnerInfinity } from '@/components/NpButton'
import { NpToast } from '@/components/NpToast'

export default function Home({ params }: { params: { archiveId: string } }) {
  const router = useRouter()

  // @ts-ignore
  const { data, isLoading, error } = useArchiveSongs(params.archiveId) || {}
  const [loadPdfError, setLoadPdfError] = React.useState<string | null>(null)
  const [showToast, setShowToast] = React.useState(true)

  const [pdfDialogParams, setPdfDialogParams] = React.useState<PdfDialogParams | null>(null)

  const onLoadPdf = async (song: Song) => {
    const response = await fetch(`/api/archive/${song.archiveId}/song/${String(song._id)}/pdf`)
    if (!response.ok) {
      setLoadPdfError(`Failed to load pdf for song ${song.songname}`)
      setTimeout(() => setLoadPdfError(null), 3000)
      return
    }
    const blob = await response.blob()
    const fileUrl = URL.createObjectURL(blob)
    setPdfDialogParams({ fileUrl, songs: data, index: data?.findIndex((s) => s._id === song._id) || 0, song })
  }

  return (
    <NpMain>
      {isLoading && <div>Ladataan...</div>}
      {error && showToast && <NpToast onClose={() => setShowToast(false)}> {JSON.stringify(error)}</NpToast>}
      {loadPdfError && <NpToast onClose={() => setLoadPdfError(null)}> {loadPdfError}</NpToast>}
      {data && !pdfDialogParams && (
        <div className='flex flex-col gap-4 w-full items-start'>
          <NpBackButton onClick={() => router.push(`/archive/${params.archiveId}`)} />

          <div className='flex-col w-full items-start flex gap-2 -mt-4 mb-4'>
            <div>Arkiston kappaleet</div>
            {data?.map((song) => (
              <ArchiveSongCard key={song._id} song={song} onLoadPdf={() => onLoadPdf(song)} />
            ))}
          </div>
        </div>
      )}
      {pdfDialogParams && (
        <PdfDialog pdfDialogParams={pdfDialogParams} onLoadPdf={onLoadPdf} onClose={() => setPdfDialogParams(null)} />
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

const ArchiveSongCard = ({ song, onLoadPdf }: { song: Song; onLoadPdf: () => void }) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const loadPdf = () => {
    setIsLoading(true)
    onLoadPdf()
  }

  return (
    <NpButtonCard>
      <div className='w-10/12 justify-self-start whitespace-nowrap' onClick={loadPdf}>
        <div className='text-lg'>{song.songname}</div>
        <div className='text-xs'>{displayPath(song)}</div>
      </div>
      <div className='2/12 justify-end flex justify-self-end flex-row w-full'>
        {isLoading && (
          <SpinnerInfinity className='w-10' thickness={200} speed={100} color='#999999' secondaryColor='#dddddd' />
        )}
      </div>
    </NpButtonCard>
  )
}
