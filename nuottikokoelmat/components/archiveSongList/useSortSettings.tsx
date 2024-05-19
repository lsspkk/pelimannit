// use client

import { Song } from '@/models/song'
import { buildSongCompare, loadSortSettings, saveSortSettings, SortSettings } from '@/models/sortSettings'
import React from 'react'

// This hook manages sort settings and provides the sorted and sorted songs
export function useSortSettings ({ archiveId, songs }: { archiveId: string; songs: Song[] }) {
	const [sortSettings, setSortSettings] = React.useState<SortSettings>(loadSortSettings(archiveId))
	const [sortedSongs, setSortedSongs] = React.useState<Song[]>([])

	React.useEffect(() => {
		saveSortSettings(archiveId, sortSettings)
		if (sortSettings.filter) {
			const filtered = songs.filter((song) => song.songname.toLowerCase().includes(sortSettings.filter.toLowerCase()))
			filtered.sort(buildSongCompare(sortSettings))
			setSortedSongs(filtered)
		} else {
			const sorted = songs.sort(buildSongCompare(sortSettings))
			setSortedSongs(sorted)
		}
	}, [sortSettings, archiveId, songs])

	return { sortSettings, setSortSettings, sortedSongs: sortedSongs }
}
