'use client'
import { NpButton } from '@/components/NpButton'
import { useRouter } from 'next/navigation'
import React from 'react'
import { NpInput } from '@/components/NpInput'
import { NpTextArea } from '@/components/NpTextarea'
import { Collection } from '@/models/collection'
import mongoose from 'mongoose'
import { useCollection } from '@/models/swrApi'
import { NpMain } from '@/components/NpMain'
import { NpSubTitle, NpTitle } from '@/components/NpTitle'
import { NpBackButton } from '@/components/NpBackButton'

export default function Home({
  params: { collectionId, archiveId },
}: {
  params: { collectionId: string; archiveId: string }
}) {
  const router = useRouter()
  const { data, mutate, error, isLoading } = useCollection(collectionId)
  const [collectionName, setCollectionName] = React.useState(data?.collectionname || '')
  const [description, setDescription] = React.useState(data?.description || '')
  const [inProgress, setInProgress] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const onSaveChanges = async (oldCollection: Collection) => {
    setInProgress(true)

    const newCollection: Collection = {
      ...oldCollection,
      collectionname: collectionName,
      description: description,
      modified: new Date(),
    }
    const response = await fetch(`/api/collection/${collectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCollection),
    })

    if (response.ok) {
      const data = await response.json()
      mutate(data)
      router.back()
    } else {
      console.error('Failed to save collection', response)
    }
    setInProgress(false)
  }

  const onDelete = async () => {
    setInProgress(true)
    const response = await fetch(`/api/collection/${collectionId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      setInProgress(false)
      console.error('Failed to delete collection', response)
    } else {
      setInProgress(false)
      router.push(`/archive/${archiveId}`)
    }
  }

  return (
    <NpMain>
      <NpBackButton onClick={() => router.back()} />
      {isLoading && <div>Ladataan...</div>}
      {error && <div>Virhe: {JSON.stringify(error)}</div>}
      {data && (
        <div className='flex flex-col gap-4 items-start'>
          <NpSubTitle className='-mt-4 mb-4'>Kokoelman muokkaus</NpSubTitle>
          <div className='flex flex-col gap-4'>
            <NpInput
              label='Nimi'
              placeholder='Nimi'
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
            />
            <NpTextArea
              label='Kuvaus'
              placeholder='Kuvaus'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className='flex gap-2 justify-end'>
              <NpButton onClick={() => setConfirmDelete(true)}>Poista</NpButton>
              <NpButton onClick={() => router.back()}>Peruuta</NpButton>
              <NpButton onClick={() => onSaveChanges(data)} inProgress={inProgress}>
                Tallenna
              </NpButton>
            </div>
          </div>
          {confirmDelete && (
            <div className='bg-gray-200 border-sm rounded-sm border-gray-400 border p-4 shadow-md w-full'>
              <div className='flex flex-col gap-4'>
                <div className='text-xl'>Poistetaanko kokoelma?</div>
                <div className='flex gap-2 justify-end'>
                  <NpButton onClick={() => setConfirmDelete(false)}>Peruuta</NpButton>
                  <NpButton onClick={onDelete} inProgress={inProgress}>
                    Poista
                  </NpButton>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </NpMain>
  )
}
