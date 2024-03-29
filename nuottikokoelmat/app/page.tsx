'use client'

import { NpSubTitle } from '@/components/NpTitle'
import { Archive } from '@/models/archive'
import { useArchives } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import { NpButtonCard } from '../components/NpButtonCard'
import { NpMain } from '../components/NpMain'
import React from 'react'
import { NpInput } from '@/components/NpInput'
import { NpButton } from '@/components/NpButton'
import { NpToast } from '@/components/NpToast'
import { NpDialog } from '../components/NpDialog'

export default function Home() {
  const { data, isLoading, error } = useArchives()
  const [showToast, setShowToast] = React.useState(true)

  return (
    <NpMain title='Nuottiarkistot'>
      {isLoading && <div>Ladataan...</div>}
      {error && showToast && <NpToast onClose={() => setShowToast(false)}> {JSON.stringify(error)}</NpToast>}
      {data && (
        <div className='flex flex-col gap-4 w-full'>
          {data.map((d) => (
            <ArchiveCard key={d._id} archive={d} />
          ))}
        </div>
      )}
    </NpMain>
  )
}

const CreationDate = ({ date }: { date: Date }) => {
  const d = new Date(date)
  return <div>{d.toLocaleDateString('fi-FI')}</div>
}

const ArchiveCard = ({ archive }: { archive: Archive }) => {
  const router = useRouter()
  const [showLogin, setShowLogin] = React.useState(false)
  const [visitorPassword, setVisitorPassword] = React.useState('')
  const [error, setError] = React.useState(' ')

  const onLogin = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const response = await fetch(`/api/archive/${archive._id}/visitor/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ visitorPassword }),
    })
    if (response.ok) {
      router.push(`/archive/${archive._id}`)
    } else {
      setError('Väärä salasana')
      setTimeout(() => setError(' '), 3000)
    }
  }

  return (
    <React.Fragment>
      {showLogin && (
        <NpDialog onClose={() => setShowLogin(false)}>
          <form onSubmit={onLogin}>
            <div className='flex flex-col gap-4 items-start'>
              <NpSubTitle>{archive.archivename}</NpSubTitle>

              <input type='text' value={archive.archivename} hidden readOnly name='username' />

              <NpInput
                autoFocus
                className='w-full'
                value={visitorPassword}
                placeholder='Vierailijan salasana'
                onChange={(e) => setVisitorPassword(e.target.value)}
                type='password'
              />
              {<div className='text-red-900 text-sm min-h-4'>{error}</div>}
              <div className='flex gap-2 mt-2 justify-between w-full'>
                <NpButton variant='secondary' onClick={() => setShowLogin(false)}>
                  Peruuta
                </NpButton>
                <NpButton type='submit' onClick={onLogin}>
                  Kirjaudu
                </NpButton>
              </div>
            </div>
          </form>
        </NpDialog>
      )}

      <NpButtonCard onClick={() => setShowLogin(true)}>
        <div className='flex flex-col gap-2 w-10/12'>
          <div>{archive.archivename}</div>
          <CreationDate date={archive.created} />
        </div>
      </NpButtonCard>
    </React.Fragment>
  )
}
