'use client'

import { Archive } from '@/models/archive'
import React, { useState, useEffect, useRef } from 'react'
import { NpMain } from '@/components/NpMain'
import { Types } from 'mongoose'
import { Song } from '@/models/song'
import { getFileMap } from '@/models/fileApi'
import { NpButton } from '@/components/NpButton'
import { PdfDialog } from '@/components/PdfDialog'

const TEST_ARCHIVE_ID = '64b82b6fd594200bb5274794'
const TEST_ARCHIVE_OBJECT_ID = new Types.ObjectId(TEST_ARCHIVE_ID)

export default function Home() {
  const [archive, setArchive] = useState<Archive | null>(null)
  const [fileMap, setFileMap] = useState<Map<Types.ObjectId, File>>(new Map())
  const [songs, setSongs] = useState<Song[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const hiddenFileInput = useRef<HTMLInputElement>(null)
  const [viewIndex, setViewIndex] = useState<number | undefined>(undefined)

  useEffect(() => {
    void fetchArchive()
  }, [])

  const fetchArchive = async () => {
    setIsLoading(true)
    const response = await fetch(`/api/archive/${TEST_ARCHIVE_ID}/test`)
    const data = await response.json()
    setArchive(data)

    const songResponse = await fetch(`/api/archive/${TEST_ARCHIVE_ID}/test/songs`)
    const songData = await songResponse.json()
    setSongs(songData)
    setIsLoading(false)
  }

  const clear = () => {
    setFileMap(new Map())
  }

  const onUploadDirectory = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const { fileMap: newFileMap, missingSongs: newMissingSongs } = getFileMap(
        songs || [],
        Array.from(event.target.files)
      )
      setFileMap(newFileMap)
      console.debug({ newMissingSongs })
      setViewIndex(0)
    }
  }

  const file = viewIndex != undefined && fileMap.get(songs?.[viewIndex]?._id as unknown as Types.ObjectId)
  const fileUrl = (file && URL.createObjectURL(file)) || ''

  return (
    <NpMain>
      {isLoading && <div>Ladataan...</div>}

      {archive && (
        <div className='flex flex-col gap-4 w-full items-start pb-4'>
          <div className='flex gap-4'>
            <input
              type='file'
              ref={hiddenFileInput}
              onChange={onUploadDirectory}
              style={{ display: 'none' }}
              // @ts-ignore
              webkitdirectory=''
              directory=''
              multiple
            />
            <div>{archive.archivename}</div>
            <div>Kappaleita: {songs?.length}</div>
          </div>
          <div>
            <div className='text-red-500'>Lataa arkiston tiedostot laitteellesi, ja testaa uploadia tästä</div>
          </div>
          <div className='flex gap-4'>
            <div>Lokaalit tiedostot</div>
            <div>{fileMap.size}</div>
            <NpButton onClick={clear}>Tyhjennä</NpButton>
            <NpButton onClick={() => hiddenFileInput?.current?.click()}>Lataa</NpButton>
          </div>
          {fileMap.size > 0 && (
            <div className='flex flex-col gap-4'>
              {songs?.map((song, index) => (
                <div className='flex w-full justify-between' key={new String(song._id).valueOf()}>
                  <div>{index}</div>
                  <div>{song.songname}</div>
                  <NpButton variant='secondary' onClick={() => setViewIndex(index)}>
                    Näytä
                  </NpButton>
                </div>
              ))}
            </div>
          )}
          {viewIndex !== undefined && songs && fileUrl != '' && (
            <PdfDialog
              pdfDialogParams={{
                songs,
                index: viewIndex,
                fileMap,
                song: songs[viewIndex],
                fileUrl,
              }}
              onLoadPdf={(index) => {
                setViewIndex(index)
                return Promise.resolve()
              }}
              onClose={() => setViewIndex(undefined)}
            />
          )}
        </div>
      )}
    </NpMain>
  )
}
