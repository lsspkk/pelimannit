'use client'
import { NpBackButton } from '@/components/NpBackButton'
import { PdfSongNavigation } from '@/components/PdfSongNavigation'
import { Song } from '@/models/song'
import { redirect, usePathname, useRouter } from 'next/navigation'
import path from 'path'
import React, { useState } from 'react'

// This component is used to display a PDF file in an iframe from the URL of the file.
export const PdfIframeView = ({ startIndex, songs }: { startIndex: number; songs: Song[] }) => {
	const router = useRouter()
	const [index, setIndex] = useState(startIndex)
	const pathname = usePathname()

	const iframeUrl = (songs && index >= 0 && index < songs.length) ? songs[index].url : null

	if (!iframeUrl) {
		const parentPath = pathname?.substring(0, pathname.lastIndexOf('/'))
		parentPath && redirect(parentPath)
		return null
	}

	return (
		<div className='fixed top-0 left-0 w-full h-full bg-white overflow-y-scroll overflow-x-hidden '>
			<NpBackButton
				onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
					e.preventDefault()
					router.back()
				}}
				className='z-10 -mr-2 -mt-6'
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
				className='w-full h-full bottom-0 z-0 scale-[107%]'
			/>
		</div>
	)
}
