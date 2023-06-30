import { NpButton } from '@/components/NpButton'
import { useArchive, useArchiveCollections } from '@/models/swrApi'
import { useRouter } from 'next/router'
import React from 'react'
import { NpTitle } from '../../components/NpTitle'
import { Archive } from '@/models/archive'
import { NpInput } from '@/components/NpInput'
import { NpTextArea } from '@/components/NpTextarea'

export default function Home() {
  const router = useRouter()

  // @ts-ignore
  const { data, isLoading, error } = useArchive(router.query.archiveId) || {}

  // lataa kokoelmat... :)

  return (
    <main className='min-h-screen'>
      <div className='flex flex-col items-center justify-between p-24'>
        {isLoading && <div>Ladataan...</div>}
        {error && <div>Virhe: {JSON.stringify(error)}</div>}
        {data && (
          <React.Fragment>
            <div className='flex flex-col gap-4'>
              <div className='flex w-full md:p-20 lg:p-40'>
                <NpTitle>Arkisto</NpTitle>
                <div>{data.archivename}</div>
              </div>
              <NpButton onClick={() => router.push(`/archive/${data._id}/songs`)}>Kappaleet</NpButton>
            </div>
            <Collections archiveId={data._id} />
          </React.Fragment>
        )}
      </div>
    </main>
  )
}

export const Collections = ({ archiveId }: { archiveId: string }) => {
  const router = useRouter()

  // @ts-ignore
  const { data, isLoading, error } = useArchiveCollections(router.query.archiveId) || {}

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-4'>
        <NpTitle>Kokoelmat</NpTitle>

        <AddCollection archiveId={archiveId} />

        {isLoading && <div>Ladataan...</div>}
        {error && <div>Virhe: {JSON.stringify(error)}</div>}
        {data && (
          <div className='flex flex-col gap-4'>
            {data?.map((collection) => (
              <div key={collection._id}>
                <div>{collection.collectionname}</div>
                <div>{collection.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export const AddCollection = ({ archiveId }: { archiveId: string }) => {
  const router = useRouter()
  const [collectionName, setCollectionName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [inProgress, setInProgress] = React.useState(false)

  const addCollection = async () => {
    setInProgress(true)
    const response = await fetch(`/api/archive/${archiveId}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collectionname: collectionName,
        collectiontype: description,
      }),
    })
    const data = await response.json()
    setInProgress(false)
    router.push(`/archive/${archiveId}/collection/${data._id}}`)
  }

  return (
    <div className='flex flex-col gap-4'>
      <NpTitle>Lisää kokoelma</NpTitle>
      <div className='flex flex-col gap-4'>
        <NpInput label='Nimi' value={collectionName} onChange={(e) => setCollectionName(e.target.value)} />
        <NpTextArea label='Kuvaus' value={description} onChange={(e) => setDescription(e.target.value)} />
        <NpButton onClick={addCollection} inProgress={inProgress}>
          Lisää
        </NpButton>
      </div>
    </div>
  )
}
