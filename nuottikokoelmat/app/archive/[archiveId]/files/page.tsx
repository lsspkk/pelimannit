'use client'

import { NpBackButton } from '@/components/NpBackButton'
import { NpButton } from '@/components/NpButton'
import { NpMain } from '@/components/NpMain'
import { NpSubTitle, NpTitle } from '@/components/NpTitle'
import { NpToast } from '@/components/NpToast'
import { getFileMap, getFileName } from '@/models/fileApi'
import { useFileMap } from '@/models/fileContext'
import { Song } from '@/models/song'
import { useArchive, useArchiveSongs } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'

export default function Home({ params }: { params: { archiveId: string } }) {
  const router = useRouter()

  const { archiveId } = params || {}
  const { data } = useArchive(archiveId)
  const { data: songs, isLoading } = useArchiveSongs(archiveId)
  const hiddenFileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(true)
  const [missingSongs, setMissingSongs] = useState<Song[]>([])
  const [fileMap, setFileMap] = useFileMap()

  const onUploadDirectory = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const { fileMap: newFileMap, missingSongs: newMissingSongs } = getFileMap(
        songs || [],
        Array.from(event.target.files)
      )
      setFileMap(newFileMap)
      setMissingSongs(newMissingSongs)
      if (newMissingSongs.length > 0) {
        setError('Arkistossa on kappaleita, joille ei löytynyt tiedostoa.')
      }
    }
  }

  function showFileName(file: File | undefined): string {
    if (!file) {
      return '-'
    }
    return getFileName(file)
  }

  const fileNameSorter = (a: File, b: File) => {
    const aName = showFileName(a)
    const bName = showFileName(b)
    return aName.localeCompare(bName)
  }

  return (
    <NpMain title='Tiedostot'>
      {isLoading && <div>Ladataan...</div>}
      {error !== '' && showToast && <NpToast onClose={() => setShowToast(false)}> {JSON.stringify(error)}</NpToast>}

      <NpBackButton onClick={() => router.back()} />

      <div className='flex flex-col gap-2 w-full items-start'>
        <div className='flex-col w-full items-start'>
          <NpSubTitle>{data?.archivename}</NpSubTitle>
        </div>
        <input
          type='file'
          ref={hiddenFileInputRef}
          onChange={onUploadDirectory}
          style={{ display: 'none' }}
          // @ts-ignore
          webkitdirectory='webkitdirectory'
          directory='directory'
          multiple
        />

        <div className='text-xs mt-2 '>
          <p>1. Tallenna arkiston kappaleet tiedostoina omalle laitteelle.</p>
          <p> 2. Lataa tiedostot välimuistiksi, nuottien katselu nopeutuu.</p>
        </div>

        <div className='flex gap-4 w-full justify-between text-sm items-end'>
          <div className='text-sm'>
            Ladattu: {fileMap.size}, puuttuu: {missingSongs.length}
          </div>
          <NpButton onClick={() => hiddenFileInputRef.current?.click()}>
            {fileMap.size > 0 ? 'Päivitä' : 'Lataa'}
          </NpButton>
        </div>

        {missingSongs.length > 0 && (
          <div className='flex flex-col gap-2 w-full items-start'>
            <NpSubTitle>Puuttuvat tiedostot</NpSubTitle>
            {missingSongs.map((s) => (
              <div key={s._id.toString() + '+missing'}>{s.path + s.songname}</div>
            ))}
          </div>
        )}

        {fileMap.size > 0 && (
          <div className='flex flex-col gap-2 w-full items-start'>
            <NpSubTitle>Ladatut tiedostot</NpSubTitle>
            {Array.from(fileMap.values())
              .sort(fileNameSorter)
              .map((value, index) => (
                <div key={showFileName(value) + '+file'} className='text-xs'>
                  {index + 1} {showFileName(value)}
                </div>
              ))}
          </div>
        )}
      </div>
    </NpMain>
  )
}
