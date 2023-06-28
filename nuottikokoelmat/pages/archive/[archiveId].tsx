import { useArchive } from '@/models/swrApi'
import { useRouter } from 'next/router'
import React from 'react'

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
          <div className='flex flex-col gap-4'>
            <div className='flex w-full md:p-20 lg:p-40'>
              <div>{data.archivename}</div>
            </div>
            <button
              onClick={() => router.push(`/archive/${data._id}/songs`)}
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            >
              Kappaleet
            </button>
            <button
              onClick={() => router.push(`/archive/${data._id}/collection/new`)}
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            >
              Uusi kokoelma
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
