'use client'

import { LoadingIndicator } from '@/components/LoadingIndicator'
import { NpButton } from '@/components/NpButton'
import { NpInput } from '@/components/NpInput'
import { NpTitle } from '@/components/NpTitle'
import React, { useState } from 'react'

export default function Home() {
	const [fileList, setFileList] = useState<string | null>(null)
	const [folderId, setFolderId] = useState<string>(process.env.NEXT_PUBLIC_DRIVE_TEST_FOLDER_ID || '')
	const [archiveId, setArchiveId] = useState<string>(process.env.NEXT_PUBLIC_DRIVE_TEST_ARCHIVE_ID || '')
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const getFileList = async (returnDevelopmentTree: boolean) => {
		setIsLoading(true)
		const response = await fetch(`/api/archive/${archiveId}/manage/drive/folder/${folderId}?developmentTree=${returnDevelopmentTree}`)
		if (response.ok) {
			const json = await response.json()
			setFileList(JSON.stringify(json, null, 2))
		}
		setIsLoading(false)
	}

	return (
		<main className='flex flex-col items-center p-2 gap-4 h-full justify-start h-screen'>
			<div className='justify-start items-center gap-4 flex-col flex'>
				<NpTitle>Testi Drive</NpTitle>

				<NpInput label='Kansion id' value={folderId} onChange={(e) => setFolderId(e.target.value)} placeholder='Kansion id' />
				<NpInput label='Akiston id' value={archiveId} onChange={(e) => setArchiveId(e.target.value)} placeholder='Arkiston id' />
			</div>

			<NpButton disabled={isLoading} onClick={() => getFileList(true)}>Hae development tree</NpButton>
			<NpButton disabled={isLoading} onClick={() => getFileList(false)}>Hae kansion tiedostotlistaus</NpButton>

			{isLoading && <LoadingIndicator />}

			<div className='flex-col justify-between w-full gap-2'>
				{fileList && <div className='flex flex-col gap-2 whitespace-pre'>{fileList}</div>}
			</div>
		</main>
	)
}
