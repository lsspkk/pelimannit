'use client'

import React, { useState } from 'react'
import { NpTitle } from '@/components/NpTitle'
import { NpButton } from '@/components/NpButton'
import { NpInput } from '@/components/NpInput'
import { Viewer } from '@react-pdf-viewer/core'
import { PdfDialog } from '@/components/PdfDialog'

export default function Home() {
  const [pdfFile, setPdfFile] = useState<Blob | null>(null)
  const [fileId, setFileId] = useState<string>('1QkpfMqg6Ey2_QvnApVnBR6iLkQOdNLi5')
  const getPdfFile = async () => {
    const response = await fetch(`/api/drive/file/${fileId}`)
    if (response.ok) {
      const pdfFile = await response.blob()
      setPdfFile(pdfFile)
    }
  }

  return (
    <main className='flex flex-col items-center p-2 gap-4 h-full justify-start h-screen'>
      <div className='justify-start items-center gap-4 flex-col flex'>
        <NpTitle>Testi Drive</NpTitle>
        <NpInput placeholder='Hae tiedostoa' type='text' value={fileId} onChange={(e) => setFileId(e.target.value)} />
      </div>

      <NpButton onClick={getPdfFile}>Hae tiedosto</NpButton>
      <div className='flex-col justify-between w-full gap-2'>
        {pdfFile && (
          <PdfDialog
            pdfDialogParams={{ index: 0, fileUrl: URL.createObjectURL(pdfFile) }}
            onClose={() => {
              setPdfFile(null)
            }}
            onLoadPdf={() => new Promise(() => {})}
          />
        )}
      </div>
    </main>
  )
}
