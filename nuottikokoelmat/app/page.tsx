'use client'

import { NpSubTitle, NpTitle } from '@/components/NpTitle'
import { Archive } from '@/models/archive'
import { useArchives } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import { NpButtonCard } from '../components/NpButtonCard'
import { NpMain } from '../components/NpMain'
import React from 'react'
import { NpInput } from '@/components/NpInput'
import { NpButton } from '@/components/NpButton'

export default function Home() {
  const { data, isLoading, error } = useArchives()

  return (
    <NpMain>
      {isLoading && <div>Ladataan...</div>}
      {error && <div>Virhe: {JSON.stringify(error)}</div>}
      {data && (
        <div className='flex flex-col gap-4 w-full'>
          <NpTitle>Nuottiarkistot</NpTitle>{' '}
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
              <NpInput
                className='w-full'
                value={visitorPassword}
                placeholder='Vierailijan salasana'
                onChange={(e) => setVisitorPassword(e.target.value)}
              />
              {<div className='text-red-900 text-sm min-h-4'>{error}</div>}
              <div className='flex gap-2 mt-2 justify-between w-full'>
                <NpButton onClick={() => setShowLogin(false)}>Peruuta</NpButton>
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

const NpDialog = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
  return (
    <React.Fragment>
      <div
        className='fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex justify-center items-center'
        onClick={onClose}
      />

      <div className='fixed top-20 left-0 flex justify-center w-full'>
        <div className='bg-white rounded-md shadow-md p-6 '>{children}</div>
      </div>
    </React.Fragment>
  )
}
