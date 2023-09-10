'use client'

import { useArchiveSongs } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React from 'react'
import { NpMain } from '@/components/NpMain'
import { NpButtonCard } from '@/components/NpButtonCard'
import { Song } from '@/models/song'
import { NpBackButton } from '@/components/NpBackButton'
import { NpIconButton } from '@/components/NpIconButton'
import { PdfDialog, PdfDialogParams } from '@/components/PdfDialog'

export default function Home({ params }: { params: { archiveId: string } }) {
  const router = useRouter()

  // @ts-ignore
  const { data, isLoading, error } = useArchiveSongs(params.archiveId) || {}

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
    setPdfDialogParams({ fileUrl, songs: data, index: data?.findIndex((s) => s._id === song._id) || 0, song })
  }

  return (
    <NpMain>
      {isLoading && <div>Ladataan...</div>}
      {error && <div>Virhe: {JSON.stringify(error)}</div>}
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
  const router = useRouter()

  return (
    <NpButtonCard>
      <div className='w-10/12 justify-self-start whitespace-nowrap' onClick={() => router.push(song.url)}>
        <div className='text-lg'>{song.songname}</div>
        <div className='text-xs'>{displayPath(song)}</div>
      </div>
      <div className='2/12 justify-end flex justify-self-end flex-row w-full'>
        <NpIconButton onClick={onLoadPdf}>PDF</NpIconButton>
      </div>
    </NpButtonCard>
  )
}
