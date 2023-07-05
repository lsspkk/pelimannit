'use client'

import { NpButton } from '@/components/NpButton'
import { useArchive, useArchiveCollections } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React from 'react'
import { NpSubTitle } from '../../../components/NpTitle'
import { NpMain } from '@/components/NpMain'
import { NpButtonCard } from '@/components/NpButtonCard'
import { AddCollection } from './AddCollection'
import { NpIconButton } from '@/components/NpIconButton'

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

const Collections = ({ archiveId }: { archiveId: string }) => {
  const router = useRouter()

  const [showAddCollection, setShowAddCollection] = React.useState(false)
  // @ts-ignore
  const { data, isLoading, error } = useArchiveCollections(archiveId) || {}

  return (
    <div className='flex flex-col gap-4 w-full pt-12 md:pt-24'>
      <div className='flex flex-row w-full justify-between items-center'>
        <NpSubTitle>Kokoelmat</NpSubTitle>
        {!showAddCollection && <NpButton onClick={() => setShowAddCollection(true)}>Lisää</NpButton>}
      </div>

      {showAddCollection && <AddCollection archiveId={archiveId} onClose={() => setShowAddCollection(false)} />}

      {!isLoading && !data && <div>Ei kokoelmia</div>}
      {isLoading && <div>Ladataan...</div>}
      {error && <div>Virhe: {JSON.stringify(error)}</div>}
      {data && (
        <div className='flex flex-col gap-4'>
          {data?.map((collection) => (
            <div className='flex flex-row w-full gap-4 items-center'>
              <NpButtonCard
                key={collection._id}
                onClick={() => router.push(`/archive/${archiveId}/collection/${collection._id}`)}
              >
                <div className='w-full'>
                  <div>{collection.collectionname}</div>
                  <div>{collection.description}</div>
                </div>
              </NpButtonCard>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
