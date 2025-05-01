import useSWR from 'swr'
import { AlternativeUrlResponse } from './alternative'
import { Archive } from './archive'
import { ArchiveUser } from './archiveUser'
import { Choice } from './choice'
import { Collection } from './collection'
import { Song } from './song'
import { User } from './user'

const fetcher = async (input: RequestInfo, init: RequestInit): Promise<any> => {
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

export const useUser = (id: string) => useSWR<User, Error>('/api/user/' + id, fetcher as () => Promise<User>)

export const useArchives = () => useSWR<Archive[], Error>('/api/archive/', fetcher as () => Promise<Archive[]>)

export const useArchive = (id: string) => useSWR<Archive, Error>('/api/archive/' + id, fetcher as () => Promise<Archive>)

export const useArchiveSongs = (id: string) => useSWR<Song[], Error>(`/api/archive/${id}/songs`, fetcher as () => Promise<Song[]>)

export const useArchiveCollections = (id: string) =>
	useSWR<Collection[], Error>(`/api/archive/${id}/collection`, fetcher as () => Promise<Collection[]>)

export const useCollection = (id: string) => useSWR<Collection, Error>(`/api/collection/${id}`, fetcher as () => Promise<Collection>)

export const useCollectionChoices = (id: string) =>
	useSWR<Choice[], Error>(`/api/collection/${id}/choices`, fetcher as () => Promise<Choice[]>)

export const useCollectionSongs = (id: string) => useSWR<Song[], Error>(`/api/collection/${id}/songs`, fetcher as () => Promise<Song[]>)

export const useArchiveUser = (id: string) => useSWR<ArchiveUser, Error>(`/api/archive/${id}/user`, fetcher as () => Promise<ArchiveUser>)

export const useIsArchiveManager = (archiveId: string) => {
	const { data: user, error } = useArchiveUser(archiveId) || {}
	return !error && user?.archiveId === archiveId
}

export const useAlternativeUrlResponse = (archiveId: string) =>
	useSWR<AlternativeUrlResponse, Error>(`/api/archive/${archiveId}/alternativeurl`, fetcher as () => Promise<AlternativeUrlResponse>)
