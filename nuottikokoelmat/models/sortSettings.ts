import { SongLite } from './song'

export type SortType = 'ASC' | 'DESC' | 'NONE'
export type SortSettings = { year: SortType; songname: SortType; filter: string }
export const defaultSortSettings: SortSettings = { year: 'DESC', songname: 'ASC', filter: '' }

const extractYear = (path: string) => {
	const parts = path.split('/')
	for (let i = parts.length - 1; i >= 0; i--) {
		const matches = parts[i].match(/20\d{2}/g)
		if (matches) {
			return parseInt(matches[matches.length - 1])
		}
	}
	return 0
}

export const buildSongCompare = ({ year, songname }: SortSettings) => {
	return (a: SongLite, b: SongLite) => {
		const aYear = extractYear(a.path)
		const bYear = extractYear(b.path)

		const aName = a.songname.toLowerCase()
		const bName = b.songname.toLowerCase()

		if (aYear < bYear && year !== 'NONE') {
			return year === 'ASC' ? -1 : 1
		}
		if (aYear > bYear && year !== 'NONE') {
			return year === 'ASC' ? 1 : -1
		}

		if (aName < bName && songname !== 'NONE') {
			return songname === 'ASC' ? -1 : 1
		}
		if (aName > bName && songname !== 'NONE') {
			return songname === 'ASC' ? 1 : -1
		}

		return 0
	}
}

export const loadSortSettings = (archiveId: string): SortSettings => {
	if (typeof window === 'undefined' || !window.localStorage) {
		return defaultSortSettings
	}
	const sortSettings = localStorage.getItem(`sortSettings-${archiveId}`)
	if (sortSettings) {
		return JSON.parse(sortSettings)
	}
	return defaultSortSettings
}

export const saveSortSettings = (archiveId: string, sortSettings: SortSettings) => {
	if (typeof window === 'undefined' || !window.localStorage) {
		return
	}
	localStorage.setItem(`sortSettings-${archiveId}`, JSON.stringify(sortSettings))
}
