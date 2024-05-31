'use client'
import { NpButton } from '@/components/NpButton'
import { NpInput } from '@/components/NpInput'
import { NpTextArea } from '@/components/NpTextarea'
import { Collection } from '@/models/collection'
import { useArchiveCollections } from '@/models/swrApi'
import mongoose from 'mongoose'
import React from 'react'

export const AddCollection = ({ archiveId, onClose }: { archiveId: string; onClose: () => void }) => {
	const [collectionName, setCollectionName] = React.useState('')
	const [description, setDescription] = React.useState('')
	const [inProgress, setInProgress] = React.useState(false)
	const [errorMessage, setErrorMessage] = React.useState('')
	const { data, mutate } = useArchiveCollections(archiveId)

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
			setErrorMessage('Kokoelman lisäys epäonnistui')
			console.error('Failed to add collection', response)
		} else {
			const saved = await response.json()
			mutate([...(data || []), saved])
			onClose()
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

					{errorMessage && <div className='text-red-500 my-2'>{errorMessage}</div>}

					<div className='flex gap-2 justify-end'>
						<NpButton onClick={onClose}>Keskeytä</NpButton>
						<NpButton onClick={addCollection} inProgress={inProgress}>Lisää</NpButton>
					</div>
				</div>
			</div>
		</div>
	)
}
