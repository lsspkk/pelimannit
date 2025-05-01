'use client'

import { PdfAlternativeFileView } from '@/components/PdfAlternativeFileView'
import { PdfIframeView } from '@/components/PdfIframeView'
import { useSongViewStore } from '@/stores/SongViewContext'
import React from 'react'

export default function Home() {
  const { index, songs, alternativeUrl } = useSongViewStore()
  if (alternativeUrl) {
    return <PdfAlternativeFileView startIndex={index} songs={songs} alternativeUrl={alternativeUrl} />
  }
  return <PdfIframeView startIndex={index} songs={songs} />
}
