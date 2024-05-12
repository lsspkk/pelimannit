'use client'

import { NpMain } from '@/components/NpMain'
import { PdfIframe } from '@/components/PdfIframe'
import { useSongView } from '@/stores/SongViewContext'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

export default function Home() {
	const router = useRouter()
	const pathname = usePathname() || ''

	const [songView, setSongView] = useSongView()

	if (songView.songs.length === 0) {
		console.debug('no songs, routing to parent')
		const parentPath = pathname.split('/').slice(0, -1).join('/')
		router.push(parentPath)
		return null
	}

	const setIframeIndex = (index: number | null) => {
		if (index === null) {
			router.back()
			return
		}
		setSongView({ ...songView, index })
	}
	const onLoadPdf = (index: number) => {
		console.debug('onLoadPdf', index)
		setSongView({ ...songView, index })
	}

	return (
		<NpMain title='Nuottien katselu'>
			<PdfIframe iframeIndex={songView.index} setIframeIndex={setIframeIndex} songs={songView.songs} onLoadPdf={onLoadPdf} />
		</NpMain>
	)
}
