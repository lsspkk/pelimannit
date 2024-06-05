'use client'

import { PdfIframeView } from '@/components/PdfIframeView'
import { useSongViewStore } from '@/stores/SongViewContext'
import React from 'react'

//
export default function Home() {
	const { index, songs } = useSongViewStore()
	return <PdfIframeView startIndex={index} songs={songs} />
}
