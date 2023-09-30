'use client'
import { NpButton } from '@/components/NpButton'
import { useArchiveCollections, useIsArchiveManager } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React from 'react'
import { NpSubTitle } from '../../../components/NpTitle'
import { NpButtonCard } from '@/components/NpButtonCard'
import { AddCollection } from './AddCollection'
import { NpToast } from '@/components/NpToast'

export const CollectionList = ({ archiveId }: { archiveId: string }) => {
  const router = useRouter()

  const [showAddCollection, setShowAddCollection] = React.useState(false)
  // @ts-ignore
  const { data, isLoading, error } = useArchiveCollections(archiveId) || {}
  const [showToast, setShowToast] = React.useState(true)

  const isManager = useIsArchiveManager(archiveId)

  return (
    <div className='flex flex-col gap-4 w-full pt-12 md:pt-24'>
      <div className='flex flex-row w-full justify-between items-center'>
        <NpSubTitle>Kokoelmat</NpSubTitle>
        {!showAddCollection && isManager && <NpButton onClick={() => setShowAddCollection(true)}>Lisää</NpButton>}
      </div>

      {showAddCollection && <AddCollection archiveId={archiveId} onClose={() => setShowAddCollection(false)} />}

      {!isLoading && data?.length === 0 && <div>Ei kokoelmia</div>}
      {isLoading && <div>Ladataan...</div>}
      {error && showToast && <NpToast onClose={() => setShowToast(false)}> {JSON.stringify(error)}</NpToast>}
      {data && (
        <div className='flex flex-col gap-4'>
          {data?.map((collection) => (
            <NpButtonCard
              key={collection._id}
              onClick={() => router.push(`/archive/${archiveId}/collection/${collection._id}`)}
            >
              <div className='w-full'>
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
