'use client'

import { PdfIframeView } from '@/components/PdfIframeView'
import { useSongView } from '@/stores/SongViewContext'
import React from 'react'

//
export default function Home() {
	const [{ index, songs }] = useSongView()
	return <PdfIframeView startIndex={index} songs={songs} />
}
