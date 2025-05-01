'use client'

import { AlternativeUrlResponse } from '@/models/alternative'
import { Song } from '@/models/song'
import { createContext, type ReactNode, useContext, useRef } from 'react'
import { type StoreApi } from 'zustand'
import { createWithEqualityFn, useStoreWithEqualityFn } from 'zustand/traditional'

export interface SongViewStore {
	songs: Song[]
	index: number
	setSongView: ({ songs, index }: { songs: Song[]; index: number }) => void
	setIndex: (index: number) => void
	setSongs: (songs: Song[]) => void
	alternativeUrl?: AlternativeUrlResponse
	setAlternativeUrl: (alternativeUrl?: AlternativeUrlResponse) => void
}

const useSongView = createWithEqualityFn<SongViewStore>()((set) => ({
	songs: [],
	index: -1,
	setSongView: ({ songs, index }: { songs: Song[]; index: number }) => set({ songs, index }),
	setIndex: (index: number) => set({ index }),
	setSongs: (songs: Song[]) => set({ songs }),
	alternativeUrl: undefined,
	setAlternativeUrl: (alternativeUrl?: AlternativeUrlResponse) => set({ alternativeUrl }),
}))

const SongViewStoreContext = createContext<StoreApi<SongViewStore> | null>(null)

export const SongViewStoreProvider = ({ children }: { children: ReactNode }) => {
	const storeRef = useRef(useSongView)
	return <SongViewStoreContext.Provider value={storeRef.current}>{children}</SongViewStoreContext.Provider>
}

export const useSongViewStore = () => {
	const storeContext = useContext(SongViewStoreContext)

	if (!storeContext) {
		throw new Error(`useSongViewStore must be use within SongViewStoreProvider`)
	}

	return useStoreWithEqualityFn(storeContext)
}
