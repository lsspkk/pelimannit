import useSWR from 'swr'
import { User } from './user'
import { Archive } from './archive'
import { Song } from './song'
import { Collection } from './collection'

const fetcher = async (input: RequestInfo, init: RequestInit) => {
  const res = await fetch(input, init)

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error: Error & { info?: string; status?: number } = new Error('An error occurred while fetching the data.')
    // Attach extra info to the error object.
    error.info = await res.json()
    error.status = res.status
    throw error
  }

  return res.json()
}

export const useUser = (id: string) => useSWR<User, Error>('/api/user/' + id, fetcher)

export const useArchives = () => useSWR<Archive[], Error>('/api/archive/', fetcher)

export const useArchive = (id: string) => useSWR<Archive, Error>('/api/archive/' + id, fetcher)

export const useArchiveSongs = (id: string) => useSWR<Song[], Error>(`/api/archive/${id}/songs`, fetcher)

export const useArchiveCollections = (id: string) =>
  useSWR<Collection[], Error>(`/api/archive/${id}/collections`, fetcher)

export const useCollection = (id: string) => useSWR<Collection, Error>(`/api/collection/${id}`, fetcher)
