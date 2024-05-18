'use client'
import { NpBackButton } from '@/components/NpBackButton'
import { PdfSongNavigation } from '@/components/PdfSongNavigation'
import { Song } from '@/models/song'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

// This component is used to display a PDF file in an iframe from the URL of the file.
export const PdfIframeView = ({ startIndex, songs }: { startIndex: number; songs: Song[] }) => {
	const router = useRouter()
	const [index, setIndex] = useState(startIndex)

	const iframeUrl = songs ? songs[index].url : null

	if (!iframeUrl) {
		return null
	}

	return (
		<div className='fixed top-0 left-0 w-full h-full bg-white overflow-y-scroll overflow-x-hidden'>
			<NpBackButton
				onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
					e.preventDefault()
					router.back()
				}}
				className='z-10'
				songPage
			/>
			<PdfSongNavigation songs={songs} index={index} onLoadPdf={(index) => setIndex(index)} />
			<iframe
				title={`Nuotti ${index + 1}`}
				// Whenever you reuse an iframe and only change its src attribute to point to some other content,
				// it’s treated as a content navigation, and the iframe’s current src gets pushed onto the browser’s window.history stack.
				// When you later try to navigate backward, your browser pops the top of the history stack, navigating the iframe itself.
				// Solution: Remount the Iframe (with a Key) to prevent it from adding to the browser history.
				key={`prevent-iframe-from-adding-to-browser-history-${iframeUrl}`}
				src={iframeUrl.replaceAll('/view?', '/preview?')}
				className='w-full h-full bottom-0 z-0'
			/>
		</div>
	)
}
