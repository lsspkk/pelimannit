'use client'

import { NpButton } from '@/components/NpButton'
import { useArchive, useArchiveCollections, useArchiveUser, useIsArchiveManager } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React from 'react'
import { NpSubTitle } from '../../../components/NpTitle'
import { NpMain } from '@/components/NpMain'
import { NpButtonCard } from '@/components/NpButtonCard'
import { AddCollection } from './AddCollection'
import { NpIconButton } from '@/components/NpIconButton'
import { NpInput } from '@/components/NpInput'
import { set } from 'mongoose'

export default function Home({ params }: { params: { archiveId: string } }) {
  const router = useRouter()

  // @ts-ignore
  const { data, isLoading, error } = useArchive(params.archiveId) || {}

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
          <StartManaging archiveId={params.archiveId} />
          <Collections archiveId={data._id} />
        </React.Fragment>
      )}
    </NpMain>
  )
}

const StartManaging = ({ archiveId }: { archiveId: string }) => {
  const [showLogin, setShowLogin] = React.useState(false)
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const { data, mutate } = useArchiveUser(archiveId)

  const onStart = async () => {
    const response = await fetch(`/api/archive/${archiveId}/manage/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    if (response.ok) {
      setShowLogin(false)
      mutate({ archiveId, username })
    } else {
      setError('Virheellinen käyttäjätunnus tai salasana')
    }
  }

  const onStop = async () => {
    const response = await fetch(`/api/archive/${archiveId}/manage/stop`)
    if (response.ok) {
      mutate({ archiveId: '', username: '' })
    } else {
      console.error('Failed to stop managing archive', response)
    }
  }

  return (
    <div className='flex-col flex gap-4 w-full items-end'>
      {!showLogin && data?.archiveId === archiveId && (
        <NpButton className='-mt-10' onClick={onStop}>
          Lopeta hallinnointi
        </NpButton>
      )}
      {!showLogin && data?.archiveId !== archiveId && (
        <NpButton className='w-28 -mt-10' onClick={() => setShowLogin(true)}>
          Kirjaudu
        </NpButton>
      )}
      {showLogin && (
        <div className='flex flex-col gap-4 w-full pt-4 md:pt-14 max-w-sm'>
          <div>Kirjaudu hallinnoimaan arkistoa</div>
          <NpInput placeholder='Käyttäjätunnus' value={username} onChange={(e) => setUsername(e.target.value)} />
          <NpInput placeholder='Salasana' value={password} onChange={(e) => setPassword(e.target.value)} />

          {error && <div className='text-red-800'>{error}</div>}
          <div className='flex flex-row gap-4 justify-end'>
            <NpButton onClick={() => setShowLogin(false)}>Peruuta</NpButton>
            <NpButton onClick={onStart}>Kirjaudu</NpButton>
          </div>
        </div>
      )}
    </div>
  )
}

const Collections = ({ archiveId }: { archiveId: string }) => {
  const router = useRouter()

  const [showAddCollection, setShowAddCollection] = React.useState(false)
  // @ts-ignore
  const { data, isLoading, error } = useArchiveCollections(archiveId) || {}

  const isManager = useIsArchiveManager(archiveId)

  return (
    <div className='flex flex-col gap-4 w-full pt-12 md:pt-24'>
      <div className='flex flex-row w-full justify-between items-center'>
        <NpSubTitle>Kokoelmat</NpSubTitle>
        {!showAddCollection && isManager && <NpButton onClick={() => setShowAddCollection(true)}>Lisää</NpButton>}
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
