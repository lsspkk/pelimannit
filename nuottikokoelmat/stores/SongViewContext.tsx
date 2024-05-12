'use client'

import { Song } from '@/models/song'
import { Types } from 'mongoose'
import React, { createContext, useContext, useState } from 'react'

interface SongView {
	songs: Song[]
	index: number
}

export const emptySongView: SongView = { songs: [], index: -1 }

type SongViewContextType = [SongView, React.Dispatch<React.SetStateAction<SongView>>]

const SongViewContext = createContext<SongViewContextType | undefined>(undefined)

// state to keep the viewer for a list of song files
export const SongViewProvider = ({ children }: { children: React.ReactNode }) => {
	const [songView, setSongView] = useState<SongView>(emptySongView)

	return <SongViewContext.Provider value={[songView, setSongView]}>{children}</SongViewContext.Provider>
}

export const useSongView = () => {
	const context = useContext(SongViewContext)
	if (context === undefined) {
		throw new Error('useSongView must be used within a SongViewProvider')
	}
	return context
}

export const useSongViewValue = () => {
	const context = useContext(SongViewContext)
	if (context === undefined) {
		throw new Error('useSongViewValue must be used within a SongViewProvider')
	}
	return context[0]
}
