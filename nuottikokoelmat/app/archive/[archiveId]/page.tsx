'use client'

import { NpButton } from '@/components/NpButton'
import { useArchive, useArchiveCollections } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React from 'react'
import { NpSubTitle, NpTitle } from '../../../components/NpTitle'
import { Archive } from '@/models/archive'
import { NpInput } from '@/components/NpInput'
import { NpTextArea } from '@/components/NpTextarea'
import { NpMain } from '@/components/NpMain'
import { Collection } from '@/models/collection'
import mongoose from 'mongoose'
import { NpButtonCard } from '@/components/NpButtonCard'

export default function Home({ params }: { params: { archiveId: string } }) {
  const router = useRouter()

  // @ts-ignore
  const { data, isLoading, error } = useArchive(params.archiveId) || {}

  // lataa kokoelmat... :)

  return (
    <NpMain>
      {isLoading && <div>Ladataan...</div>}
      {error && <div>Virhe: {JSON.stringify(error)}</div>}
      {data && (
        <React.Fragment>
          <div className='flex flex-col gap-4 w-full items-start'>
            <div className='flex-col w-full items-start'>
              <NpSubTitle>Arkisto</NpSubTitle>
              <div>{data.archivename}</div>
            </div>
            <NpButton onClick={() => router.push(`/archive/${data._id}/songs`)}>Kappaleet</NpButton>
          </div>
          <Collections archiveId={data._id} />
        </React.Fragment>
      )}
    </NpMain>
  )
}

export const Collections = ({ archiveId }: { archiveId: string }) => {
  const router = useRouter()

  // @ts-ignore
  const { data, isLoading, error } = useArchiveCollections(archiveId) || {}

  console.debug(error)
  return (
    <div className='flex flex-col gap-4 w-full pt-12 md:pt-24'>
      <NpSubTitle>Kokoelmat</NpSubTitle>

      {!isLoading && !data && <div>Ei kokoelmia</div>}

      <AddCollection archiveId={archiveId} />

      {isLoading && <div>Ladataan...</div>}
      {error && <div>Virhe: {JSON.stringify(error)}</div>}
      {data && (
        <div className='flex flex-col gap-4'>
          {data?.map((collection) => (
            <NpButtonCard
              onClick={() => router.push(`/archive/${archiveId}/collection/${collection._id}`)}
              key={collection._id}
            >
              <div>
                <div>{collection.collectionname}</div>
                <div>{collection.description}</div>
              </div>
            </NpButtonCard>
          ))}
        </div>
      )}
    </div>
  )
}

export const AddCollection = ({ archiveId }: { archiveId: string }) => {
  const router = useRouter()
  const [collectionName, setCollectionName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [inProgress, setInProgress] = React.useState(false)
  const [showAdd, setShowAdd] = React.useState(false)

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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCollection),
    })
    const data = await response.json()
    setInProgress(false)
    router.push(`/archive/${archiveId}/collection/${data._id}`)
  }

  return (
    <div className='flex flex-col gap-4 items-start'>
      {!showAdd && <NpButton onClick={() => setShowAdd(true)}>Lisää</NpButton>}
      {showAdd && (
        <div className='bg-gray-200 border-sm rounded-sm border-gray-400 border p-4 shadow-md w-full'>
          <div className='flex flex-col gap-4'>
            <NpInput placeholder='Nimi' value={collectionName} onChange={(e) => setCollectionName(e.target.value)} />
            <NpTextArea placeholder='Kuvaus' value={description} onChange={(e) => setDescription(e.target.value)} />

            <div className='flex gap-2 justify-end'>
              <NpButton onClick={() => setShowAdd(false)}>Peruuta</NpButton>
              <NpButton onClick={addCollection} inProgress={inProgress}>
                Lisää
              </NpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
