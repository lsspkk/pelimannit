'use client'

import { useArchives } from '@/models/swrApi'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { data, isLoading, error } = useArchives()
  const router = useRouter()

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      {isLoading && <div>Ladataan...</div>}
      {error && <div>Virhe: {JSON.stringify(error)}</div>}
      {data && (
        <div className='flex flex-col gap-4'>
          {data.map((d) => (
            <div key={d._id} className='flex gap-4 align-middle items-center w-full md:p-20 lg:p-40'>
              <div>{d.archivename}</div>
              <button
                onClick={() => router.push(`/archive/${d._id}`)}
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
              >
                Valitse
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
