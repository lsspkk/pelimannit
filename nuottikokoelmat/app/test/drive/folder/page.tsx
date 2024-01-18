'use client'

import React, { useState } from 'react'
import { NpTitle } from '@/components/NpTitle'
import { NpButton } from '@/components/NpButton'

export default function Home() {
  const [fileList, setFileList] = useState<string | null>(null)
  const [folderId, setFolderId] = useState<string>(process.env.NEXT_PUBLIC_DRIVE_TEST_FOLDER_ID || '')

  const getFileList = async () => {
    const response = await fetch(`/api/drive/folder/${folderId}`)
    if (response.ok) {
      const json = await response.json()
      setFileList(JSON.stringify(json, null, 2))
    }
  }

  return (
    <main className='flex flex-col items-center p-2 gap-4 h-full justify-start h-screen'>
      <div className='justify-start items-center gap-4 flex-col flex'>
        <NpTitle>Testi Drive</NpTitle>
      </div>

      <NpButton onClick={getFileList}>Hae kansio</NpButton>
      <div className='flex-col justify-between w-full gap-2'>
        {fileList && <div className='flex flex-col gap-2 whitespace-pre'>{fileList}</div>}
      </div>
    </main>
  )
}
