'use client'

import { NpButton } from '@/components/NpButton'
import { useArchive, useArchiveCollections, useArchiveUser, useIsArchiveManager } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React from 'react'
import { NpSubTitle } from '../../../components/NpTitle'
import { NpMain } from '@/components/NpMain'
import { NpButtonCard } from '@/components/NpButtonCard'
import { AddCollection } from './AddCollection'
import { NpInput } from '@/components/NpInput'
import { NpToast } from '@/components/NpToast'
import { NpBackButton } from '@/components/NpBackButton'

type ManagingSection = 'NONE' | 'LOGIN' | 'MANAGE'

export default function Home({ params }: { params: { archiveId: string } }) {
  const router = useRouter()

  const { archiveId } = params || {}
  // @ts-ignore
  const { data, isLoading, error } = useArchive(archiveId) || {}
  const [section, setSection] = React.useState<ManagingSection>('NONE')
  const { data: archiveUser, mutate: mutateArchiveUser } = useArchiveUser(archiveId)
  const [showToast, setShowToast] = React.useState(true)

  const onStop = async () => {
    const response = await fetch(`/api/archive/${archiveId}/manage/stop`)
    if (response.ok) {
      mutateArchiveUser({ archiveId: '', username: '' })
    } else {
      console.error('Failed to stop managing archive', response)
    }
  }
  const onLogout = async () => {
    if (section === 'NONE' && archiveUser?.archiveId === archiveId) {
      await onStop()
    }
    const response = await fetch(`/api/archive/${archiveId}/visitor/logout`)
    if (response.ok) {
      router.push('/')
    } else {
      console.error('Failed to logout', response)
    }
  }

  return (
    <NpMain>
      {isLoading && <div>Ladataan...</div>}
      {error && showToast && <NpToast onClose={() => setShowToast(false)}> {JSON.stringify(error)}</NpToast>}

      <NpBackButton onClick={onLogout} />

      {data && (
        <React.Fragment>
          <div className='flex flex-col gap-4 w-full items-start'>
            <div className='flex-col w-full items-start'>
              <NpSubTitle>Arkisto</NpSubTitle>
              <div>{data.archivename}</div>
            </div>
            {section === 'NONE' && (
              <NpButton onClick={() => router.push(`/archive/${data._id}/songs`)}>Kappaleet</NpButton>
            )}
          </div>
          <div className='flex-col flex gap-4 w-full items-end'>
            {section === 'NONE' && archiveUser?.archiveId !== archiveId && (
              <NpButton variant='secondary' className='w-28 -mt-10' onClick={() => setSection('LOGIN')}>
                Ylläpito
              </NpButton>
            )}
            {section === 'NONE' && archiveUser?.archiveId === archiveId && (
              <NpButton className='-mt-10' onClick={() => setSection('MANAGE')}>
                Asetukset
              </NpButton>
            )}
            {section === 'NONE' && archiveUser?.archiveId === archiveId && (
              <NpButton className='' onClick={onStop}>
                Lopeta hallinnointi
              </NpButton>
            )}
            {section === 'LOGIN' && <ArchiveLoginSection archiveId={archiveId} setSection={setSection} />}
            {section === 'MANAGE' && <ArchiveManageSection archiveId={archiveId} setSection={setSection} />}
          </div>
          {section === 'NONE' && <Collections archiveId={data._id} />}
        </React.Fragment>
      )}
    </NpMain>
  )
}

const ArchiveLoginSection = ({
  archiveId,
  setSection,
}: {
  archiveId: string
  setSection: (section: ManagingSection) => void
}) => {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const { mutate } = useArchiveUser(archiveId)

  const onStart = async () => {
    const response = await fetch(`/api/archive/${archiveId}/manage/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    if (response.ok) {
      setSection('NONE')
      mutate({ archiveId, username })
    } else {
      setError('Virheellinen käyttäjätunnus tai salasana')
    }
  }
  return (
    <div className='flex flex-col gap-4 w-full pt-4 md:pt-14 max-w-sm'>
      <div>Kirjaudu hallinnoimaan arkistoa</div>
      <NpInput placeholder='Käyttäjätunnus' value={username} onChange={(e) => setUsername(e.target.value)} />
      <NpInput type='password' placeholder='Salasana' value={password} onChange={(e) => setPassword(e.target.value)} />

      {error && <div className='text-red-800'>{error}</div>}
      <div className='flex flex-row gap-4 justify-between'>
        <NpButton variant='secondary' onClick={() => setSection('NONE')}>
          Peruuta
        </NpButton>
        <NpButton onClick={onStart}>Kirjaudu</NpButton>
      </div>
    </div>
  )
}

const ArchiveManageSection = ({
  archiveId,
  setSection,
}: {
  archiveId: string
  setSection: (section: ManagingSection) => void
}) => {
  const { data: archive, mutate: mutateArchive } = useArchive(archiveId)
  const [password, setPassword] = React.useState(archive?.visitorPassword || '')
  const [error, setError] = React.useState('')

  const onUpdatePassword = async () => {
    const response = await fetch(`/api/archive/${archiveId}/manage/visitorPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ visitorPassword: password }),
    })
    if (response.ok && archive) {
      mutateArchive({ ...archive, visitorPassword: password })
    } else {
      setError('Virheellinen salasana')
    }
  }
  const saveDisabled = password === archive?.visitorPassword || password.length < 4

  return (
    <div className='flex flex-col gap-4 w-full pt-12 md:pt-24'>
      <NpButton className='w-28 -mt-8 self-end' onClick={() => setSection('NONE')}>
        Peruuta
      </NpButton>

      {archive && (
        <div className='flex flex-col gap-4 w-full pt-4 md:pt-14 max-w-sm justify-end self-end'>
          <div>Vierailijoiden salasana</div>
          <div className='text-sm'>Vanha: {archive.visitorPassword}</div>
          <div className='flex flex-row gap-4 justify-stretch'>
            <div>Uusi:</div>
            <NpInput placeholder='Salasana' value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className='text-red-800'>{error}</div>}
          <div className='flex flex-row gap-4 justify-end'>
            <NpButton disabled={saveDisabled} onClick={onUpdatePassword}>
              Tallenna
            </NpButton>
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
