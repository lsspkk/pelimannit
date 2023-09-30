'use client'

import { NpButton } from '@/components/NpButton'
import { useArchive, useArchiveUser } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React from 'react'
import { NpSubTitle } from '../../../components/NpTitle'
import { NpMain } from '@/components/NpMain'
import { NpToast } from '@/components/NpToast'
import { NpBackButton } from '@/components/NpBackButton'
import { ArchiveLoginSection } from './ArchiveLoginSection'
import { ArchiveManageSection } from './ArchiveManageSection'
import { CollectionList } from './CollectionList'

export type ManagingSection = 'NONE' | 'LOGIN' | 'MANAGE'

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
          <div className='flex-col flex gap-4 w-full items-end -mt-10'>
            {section === 'NONE' && (
              <NpButton onClick={() => router.push(`/archive/${archiveId}/files`)}>Tiedostot</NpButton>
            )}
            {section === 'NONE' && archiveUser?.archiveId !== archiveId && (
              <NpButton variant='secondary' className='w-28' onClick={() => setSection('LOGIN')}>
                Ylläpito
              </NpButton>
            )}
            {section === 'NONE' && archiveUser?.archiveId === archiveId && (
              <NpButton className='' onClick={() => setSection('MANAGE')}>
                Asetukset
              </NpButton>
            )}
            {section === 'NONE' && archiveUser?.archiveId === archiveId && (
              <NpButton className='' onClick={onStop}>
                Lopeta ylläpito
              </NpButton>
            )}
            {section === 'LOGIN' && <ArchiveLoginSection archiveId={archiveId} setSection={setSection} />}
            {section === 'MANAGE' && <ArchiveManageSection archiveId={archiveId} setSection={setSection} />}
          </div>
          {section === 'NONE' && <CollectionList archiveId={data._id} />}
        </React.Fragment>
      )}
    </NpMain>
  )
}
