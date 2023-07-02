'use client'

import { NpTitle } from '@/components/NpTitle'
import { Archive } from '@/models/archive'
import { useArchives } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import { NpButtonCard } from '../components/NpButtonCard'
import { NpMain } from '../components/NpMain'

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
  return (
    <NpButtonCard onClick={() => router.push(`/archive/${archive._id}`)}>
      <div className='flex flex-col gap-2 w-10/12'>
        <div>{archive.archivename}</div>
        <CreationDate date={archive.created} />
      </div>
    </NpButtonCard>
  )
}
