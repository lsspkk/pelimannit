'use client'
import { NpButton } from '@/components/NpButton'
import { useArchiveUser } from '@/models/swrApi'
import React from 'react'
import { NpInput } from '@/components/NpInput'
import { ManagingSection } from './page'

export const ArchiveLoginSection = ({
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
      <div>Kirjaudu ylläpitämään arkistoa</div>
      <NpInput autoFocus placeholder='Käyttäjätunnus' value={username} onChange={(e) => setUsername(e.target.value)} />
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