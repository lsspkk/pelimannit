import { ArchiveModel } from '@/models/archive'
import { dbConnect } from '@/models/dbConnect'
import { SongModel } from '@/models/song'
import { buildSongCompare, defaultSortSettings } from '@/models/sortSettings'
import { Types } from 'mongoose'
import type { NextApiRequest, NextApiResponse } from 'next'
import { hasArchiveAuth, isArchiveVisitor } from '../../auth'
import { hasApi, secureFetch } from '../../config'

async function handler (req: NextApiRequest, res: NextApiResponse): Promise<void> {
	const archiveId = req.query.archiveId as string
	if (!await isArchiveVisitor(req, res)) {
		return
	}

	try {
		if (hasApi('/api/archive/:archiveId/songs')) {
			await apiHandler(req, res, archiveId)
		} else {
			await mongoHandler(req, res, archiveId)
		}
	} catch (error) {
		console.log(error)
		res.status(500).json({ error })
	}
}

const apiHandler = async (req: NextApiRequest, res: NextApiResponse, archiveId: string): Promise<void> => {
	if (req.method === 'GET') {
		const response = await secureFetch(`/api/v1/archive/${archiveId}/songs`)
		const json = await response.json()
		res.status(response.status).json(json)
	} else if (req.method === 'PATCH') {
		if (!await hasArchiveAuth(req, res, 'manager')) {
			res.status(401).json({ error: 'not authorized' })
			return
		}

		const response = await secureFetch(`/api/v1/archive/${archiveId}/songs`, {
			method: 'PATCH',
			body: JSON.stringify(req.body),
			headers: { 'Content-Type': 'application/json' },
		})
		const json = await response.json()
		res.status(response.status).json(json)
	} else {
		res.status(500).json({ error: 'method not supported' })
	}
}

const mongoHandler = async (req: NextApiRequest, res: NextApiResponse, archiveId: string): Promise<void> => {
	await dbConnect()
	if (req.method === 'GET') {
		console.debug('GET archive', archiveId)
		const songs = (await SongModel.find({ archiveId }).exec()).sort(buildSongCompare(defaultSortSettings))
		res.status(200).json([...songs])
	} else if (req.method === 'PATCH') {
		if (!await hasArchiveAuth(req, res, 'manager')) {
			res.status(401).json({ error: 'not authorized' })
			return
		}

		const body = req.body as { hideSongIds: string[]; showSongIds: string[] }
		const { hideSongIds, showSongIds } = body
		const hidden = await SongModel.updateMany({ _id: { $in: hideSongIds.map((id) => new Types.ObjectId(id)) } }, {
			hide: true,
			hideDate: new Date(),
		})
		const shown = await SongModel.updateMany({ _id: { $in: showSongIds.map((id) => new Types.ObjectId(id)) } }, {
			hide: false,
			hideDate: undefined,
		})
		return res.status(200).json({ hidden, shown })
	} else {
		res.status(500).json({ error: 'method not supported' })
	}
}

export default handler
