// use client

import { Song } from '@/models/song'
import { buildSongCompare, loadSortSettings, saveSortSettings, SortSettings } from '@/models/sortSettings'
import { useSongViewStore } from '@/stores/SongViewContext'
import React from 'react'

// This hook manages sort settings and provides the sorted and sorted songs
export function useSortSettings ({ archiveId, songs }: { archiveId: string; songs: Song[] }) {
	const [sortSettings, setSortSettings] = React.useState<SortSettings>(loadSortSettings(archiveId))
	const { setSongs, songs: sortedSongs } = useSongViewStore()

	const updateSortSettings = (newSettings: SortSettings) => {
		saveSortSettings(archiveId, newSettings)
		const updatedSongs = sortAndFilter(songs, newSettings)
		setSortSettings(newSettings)
		setSongs(updatedSongs)
	}

	React.useEffect(() => {
		const updatedSongs = sortAndFilter(songs, sortSettings)
		setSongs(updatedSongs)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const sortAndFilter = (songs: Song[], newSettings: SortSettings) => {
		const songsToSort = !newSettings.filter
			? songs
			: songs.filter((song) => song.songname.toLowerCase().includes(newSettings.filter.toLowerCase()))
		return songsToSort.sort(buildSongCompare(newSettings))
	}

	return { sortSettings, updateSortSettings, sortedSongs }
}
