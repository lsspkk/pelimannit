'use client'

import { useCollection, useCollectionSongs, useIsArchiveManager } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React from 'react'
import { NpMain } from '@/components/NpMain'
import { ChoiceOrder } from '@/models/choice'
import { NpButton } from '@/components/NpButton'
import { NpBackButton } from '@/components/NpBackButton'
import { PencilIcon } from '@/components/icons/PencilIcon'
import { NpSubTitle } from '@/components/NpTitle'
import { NpToast } from '@/components/NpToast'
import { BasicSongList } from './BasicSongList'
import { DnDSongList } from './DnDSongList'

export default function Home({
  params: { archiveId, collectionId },
}: {
  params: { archiveId: string; collectionId: string }
}) {
  const router = useRouter()

  // @ts-ignore
  const { data, mutate, isLoading: isLoadingSongs, errorSongs } = useCollectionSongs(collectionId) || {}
  const { data: collection, isLoading: isLoadingCollection, error: errorCollection } = useCollection(collectionId) || {}
  const isManager = useIsArchiveManager(archiveId)
  const [showToast, setShowToast] = React.useState(true)

  const saveSongOrder = async (orderedSongs: ChoiceOrder[]) => {
    const res = await fetch(`/api/collection/${collectionId}/choice/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderedSongs),
    })
    if (!res.ok) {
      throw new Error('Failed to save song order')
    } else {
      mutate()
    }
  }

  const isLoading = isLoadingSongs || isLoadingCollection
  const error = errorSongs || errorCollection

  return (
    <NpMain>
      {isLoading && <div>Ladataan...</div>}
      {error && showToast && <NpToast onClose={() => setShowToast(false)}> {JSON.stringify(error)}</NpToast>}
      {collection && (
        <div className='flex flex-col gap-4 w-full items-start -mt-4'>
          <NpBackButton onClick={() => router.push(`/archive/${archiveId}`)} />

          <div className='w-full justify-between flex'>
            <div className='w-full'>
              <NpSubTitle>{collection?.collectionname}</NpSubTitle>
              <div className='text-sm mb-4'>{collection?.description}</div>
            </div>
            {isManager && (
              <div className=''>
                <NpButton
                  className='flex items-center gap-2 px-[0.5em]'
                  onClick={() => router.push(`/archive/${archiveId}/collection/${String(collection._id)}/edit`)}
                >
                  <PencilIcon className='w-6 h-6' />
                  Muokkaa
                </NpButton>
              </div>
            )}
          </div>
          {isManager && (
            <NpButton onClick={() => router.push(`/archive/${archiveId}/collection/${collectionId}/songs`)}>
              Kappalevalinnat
            </NpButton>
          )}

          <div className='flex-col w-full items-start flex'>
            {data && data.length > 0 && isManager && <DnDSongList songs={data} saveSongOrder={saveSongOrder} />}
            {data && data.length > 0 && !isManager && <BasicSongList songs={data} />}
            {data?.length === 0 && <div className='text-xs'>Ei valittuja kappaleita</div>}
          </div>
        </div>
      )}
    </NpMain>
  )
}
