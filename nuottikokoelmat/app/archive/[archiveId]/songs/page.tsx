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
import { Song } from '@/models/song'
import { SortSettings, buildSongCompare, loadSortSettings, saveSortSettings } from '@/models/sortSettings'
import { NpButton } from '@/components/NpButton'
import { NpDialog } from '@/components/NpDialog'
import { NpInput } from '@/components/NpInput'

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
    <NpMain title='Arkiston kappaleet'>
      {isLoading && <div>Ladataan...</div>}
      {error && showToast && <NpToast onClose={() => setShowToast(false)}> {JSON.stringify(error)}</NpToast>}
      {loadPdfError && <NpToast onClose={() => setLoadPdfError(null)}> {loadPdfError}</NpToast>}
      {songs && !pdfDialogParams && !showIframe && (
        <div className='flex flex-col gap-4 w-full items-start'>
          <NpBackButton onClick={() => router.push(`/archive/${params.archiveId}`)} />

          <SongList songs={songs} onLoadPdf={onLoadPdf} archiveId={params.archiveId} />
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

const FirstAlphabet = ({ children }: { children: React.ReactNode }) => (
  <div className='text-2xl font-bold text-gray-500'>{children}</div>
)

const SongList = ({
  songs,
  onLoadPdf,
  archiveId,
}: {
  songs: Song[]
  onLoadPdf: (index: number) => void
  archiveId: string
}) => {
  const [showControls, setShowControls] = React.useState(false)
  const [sortSettings, setSortSettings] = React.useState<SortSettings>(loadSortSettings(archiveId))
  const [filteredSongs, setFilteredSongs] = React.useState<Song[]>(songs.sort(buildSongCompare(sortSettings)))

  React.useEffect(() => {
    saveSortSettings(archiveId, sortSettings)
    if (sortSettings.filter) {
      const filtered = songs.filter((song) => song.songname.toLowerCase().includes(sortSettings.filter.toLowerCase()))
      filtered.sort(buildSongCompare(sortSettings))
      setFilteredSongs(filtered)
    } else {
      const sorted = songs.sort(buildSongCompare(sortSettings))
      setFilteredSongs(sorted)
    }
  }, [sortSettings, archiveId, songs])

  const isFirstAlphabet = (songs: any, index: number) => {
    const isLetter = songs[index].songname.charAt(0).match(/[a-zåäö]/i)
    if (!isLetter) return false

    if (index === 0) return true
    if (songs[index - 1].songname.charAt(0) !== songs[index].songname.charAt(0)) return true
    return false
  }

  return (
    <div className='flex flex-col gap-4 w-full items-start'>
      <div className=' self-end -mt-2 mb-2'>
        <NpButton
          className='px-[7px] py-[6px] m-[5px] rounded-full fixed right-0'
          onClick={() => setShowControls(true)}
        >
          <SortSettingsIcon />
        </NpButton>
      </div>
      {showControls && (
        <SortSettingsDialog
          onClose={() => setShowControls(false)}
          sortSettings={sortSettings}
          setSortSettings={setSortSettings}
        />
      )}
      <div className='flex-col w-full items-start flex gap-2 -mt-4 mb-4'>
        {filteredSongs.map((song, index) => (
          <BasicSongCard
            key={String(song._id)}
            song={song}
            onLoadPdf={() => onLoadPdf(songs.findIndex((s) => s._id === song._id))}
            index={index}
          >
            {sortSettings.year === 'NONE' && isFirstAlphabet(filteredSongs, index) && (
              <FirstAlphabet>{song.songname.charAt(0)}</FirstAlphabet>
            )}
          </BasicSongCard>
        ))}
      </div>
    </div>
  )
}

const SortSettingsIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-6 w-6 text-gray-100'
    fill='none'
    viewBox='0 0 262 170'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M109 2H261.5M109 58.0083H226.927M109 112.5H205.538M109 171H173.166' stroke='black' strokeWidth='12' />
    <path d='M41.2617 2V171M41.2617 171L77 129.537M41.2617 171L2 129.537' stroke='black' strokeWidth='10' />
  </svg>
)

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-6 w-6 hover:text-gray-700 text-gray-400 cursor-pointer'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    onClick={onClick}
  >
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
  </svg>
)

const SortSettingsDialog = ({
  onClose,
  sortSettings,
  setSortSettings,
}: {
  onClose: () => void
  sortSettings: SortSettings
  setSortSettings: (sortSettings: SortSettings) => void
}) => {
  const { year, songname } = sortSettings
  const yearDesc = year === 'DESC' && songname === 'ASC'
  const songnameAsc = songname === 'ASC' && year === 'NONE'
  const songnameDesc = songname === 'DESC' && year === 'NONE'

  const onSortRadio = (year: 'ASC' | 'DESC' | 'NONE', songname: 'ASC' | 'DESC' | 'NONE') => {
    setSortSettings({ ...sortSettings, year, songname })
  }

  return (
    <NpDialog onClose={onClose}>
      <div className='flex w-full justify-end'>
        <div className='-mt-2 mb-2 -mr-2'>
          <CloseButton onClick={onClose} />
        </div>
      </div>
      <div className='flex gap-4 content-evenly'>
        <div className='flex flex-col gap-2 w-1/2'>
          <label htmlFor='filter' className='text-gray-500'>
            Rajaus
          </label>
          <NpInput
            id='filter'
            value={sortSettings.filter}
            onChange={(e) => setSortSettings({ ...sortSettings, filter: e.target.value })}
          />
        </div>

        <div className='flex flex-col gap-2 w-1/2 ml-6'>
          <div className='text-gray-500'>Järjestys</div>
          <div className='flex gap-2'>
            <input
              id='yearAsc'
              type='radio'
              name='sortType'
              value='yearDesc'
              checked={yearDesc}
              onChange={() => onSortRadio('DESC', 'ASC')}
            />
            <label htmlFor='yearAsc' onClick={() => onSortRadio('DESC', 'ASC')}>
              Vuosi
            </label>
          </div>

          <div className='flex gap-2 '>
            <input
              type='radio'
              name='sortType'
              value='songnameAsc'
              checked={songnameAsc}
              onChange={() => onSortRadio('NONE', 'ASC')}
            />
            <label htmlFor='songnameAsc' onClick={() => onSortRadio('NONE', 'ASC')}>
              Nimi A-Ö
            </label>
          </div>

          <div className='flex gap-2'>
            <input
              type='radio'
              name='sortType'
              value='songnameDesc'
              checked={songnameDesc}
              onChange={() => onSortRadio('NONE', 'DESC')}
            />
            <label htmlFor='songnameDesc' onClick={() => onSortRadio('NONE', 'DESC')}>
              Nimi Ö-A
            </label>
          </div>
        </div>
      </div>
    </NpDialog>
  )
}
