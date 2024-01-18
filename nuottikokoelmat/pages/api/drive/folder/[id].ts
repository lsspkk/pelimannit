// backend for testing google drive api

import { SongLite } from '@/models/song'
import { buildSongCompare, defaultSortSettings } from '@/models/sortSettings'
import ahjola_tree from '@/omadata/ahjola_pelimannit_tree.json'
import { drive_v3, google } from 'googleapis'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '../getAuth'

export interface DriveFile {
	id: string
	name: string
	mimeType: string
	parents?: string[]
	children?: DriveFile[]
}
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
	const folderId = req.query.id as string

	try {
		if (req.method === 'GET') {
			if (!process.env.CREATE_PASSWORD) {
				res.status(401).json({ error: 'go away' })
				return
			}

			const auth = await getAuth()

			if (!auth) {
				res.status(500).json({ error: 'no client' })
				return
			}

			const tree = ahjola_tree || await loadAndBuildTree(auth, folderId, res)
			const songList = buildSongList('/', tree as DriveFile[], []).sort(buildSongCompare(defaultSortSettings))
			res.status(200).json(songList)
		} else {
			res.status(500).json({ error: 'method not supported' })
		}
	} catch (error) {
		console.log(error)
		res.status(500).json({ error })
	}
}

const loadAndBuildTree = async (auth: any, folderId: string, res: NextApiResponse) => {
	if (!ahjola_tree) {
		const drive = google.drive({ version: 'v3', auth })
		const response = await drive.files.list({ q: `'${folderId}' in parents and trashed=false` })

		if (!response.data?.files) {
			res.status(500).json({ error: 'no data' })
			return
		}
		await buildTree(drive, response.data.files)
	}
	return ahjola_tree
}

async function buildTree (drive: drive_v3.Drive, files: import('googleapis').drive_v3.Schema$File[]) {
	for (const file of files as DriveFile[]) {
		if (file.mimeType !== 'application/vnd.google-apps.folder') {
			continue
		}

		const r = await drive.files.list({ q: `'${file.id}' in parents and trashed=false` })
		file.children = (r.data.files as DriveFile[]) || []
		await buildTree(drive, file.children)
	}
}

function buildSongList (parentPath: string, ahjola_tree: DriveFile[], songs: SongLite[] = []) {
	for (const file of ahjola_tree) {
		if (file.mimeType === 'application/vnd.google-apps.folder' && file.children) {
			for (const child of file.children) {
				buildSongList(`${parentPath}${file.name}/`, [child], songs)
			}
		} else {
			console.debug(file.id, file.name, parentPath)
			songs.push({ songname: file.name, path: parentPath, url: makeGoogleViewUrl(file.id) })
		}
	}
	return songs
}

function makeGoogleViewUrl (id: string) {
	return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`
}
