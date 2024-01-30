'use client'
import { NpButton } from '@/components/NpButton'
import { NpInput } from '@/components/NpInput'
import { NpTextArea } from '@/components/NpTextarea'
import { Collection } from '@/models/collection'
import { useArchive, useArchiveCollections } from '@/models/swrApi'
import mongoose from 'mongoose'
import { useRouter } from 'next/navigation'
import React from 'react'

export const AddCollection = ({ archiveId, onClose }: { archiveId: string; onClose: () => void }) => {
	const router = useRouter()
	const [collectionName, setCollectionName] = React.useState('')
	const [description, setDescription] = React.useState('')
	const [inProgress, setInProgress] = React.useState(false)
	const { data, mutate, error, isLoading } = useArchiveCollections(archiveId)

	const addCollection = async () => {
		setInProgress(true)

		const newCollection: Collection = {
			collectionname: collectionName,
			description: description,
			modified: new Date(),
			created: new Date(),
			archiveId: archiveId as unknown as mongoose.Types.ObjectId,
		}
		const response = await fetch(`/api/archive/${archiveId}/collection`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newCollection),
		})
		if (!response.ok) {
			console.error('Failed to add collection', response)
		} else {
			const saved = await response.json()
			mutate([...(data || []), saved])
			setTimeout(() => router.push(`/archive/${archiveId}`), 200)
		}
		setInProgress(false)
	}

	return (
		<div className='flex flex-col gap-4 items-start'>
			<div className='bg-gray-200 border-sm rounded-sm border-gray-400 border p-4 shadow-md w-full'>
				<div className='flex flex-col gap-4'>
					<div>Kokoelman lisäys</div>
					<NpInput placeholder='Nimi' value={collectionName} onChange={(e) => setCollectionName(e.target.value)} />
					<NpTextArea placeholder='Kuvaus' value={description} onChange={(e) => setDescription(e.target.value)} />

					<div className='flex gap-2 justify-end'>
						<NpButton onClick={onClose}>Takaisin</NpButton>
						<NpButton onClick={addCollection} inProgress={inProgress}>Lisää</NpButton>
					</div>
				</div>
			</div>
		</div>
	)
}
