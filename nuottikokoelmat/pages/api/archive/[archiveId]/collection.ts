import { ArchiveRole } from '@/models/archiveUser'
import { Collection, CollectionModel } from '@/models/collection'
import { dbConnect } from '@/models/dbConnect'
import { hasApi, secureFetch } from '@/pages/api/config'
import mongoose from 'mongoose'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession, hasArchiveAuth, isArchiveVisitor } from '../../auth'

async function handler (req: NextApiRequest, res: NextApiResponse): Promise<void> {
	if (!await isArchiveVisitor(req, res)) {
		return
	}
	if (req.method === 'POST' && !await hasArchiveAuth(req, res, ArchiveRole.USER)) {
		return
	}
	const archiveId = req.query.archiveId as string
	try {
		if (hasApi('/api/archive/:archiveId/collection')) {
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
	if (req.method === 'POST') {
		const response = await secureFetch(`/api/v1/archive/${archiveId}/collection`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(req.body),
		})
		const json = await response.json()
		res.status(response.status).json(json)
	} else if (req.method === 'GET') {
		const response = await secureFetch(`/api/v1/archive/${archiveId}/collection`)
		const json = await response.json()
		res.status(response.status).json(json)
	} else {
		res.status(500).json({ error: 'method not supported' })
	}
}

const mongoHandler = async (req: NextApiRequest, res: NextApiResponse, archiveId: string): Promise<void> => {
	await dbConnect()

	if (req.method === 'POST') {
		const session = await getSession(req, res)
		if (session.archiveUser?.archiveId !== archiveId) {
			res.status(401).json({ error: 'Unauthorized' })
			return
		}

		const collection = req.body as Collection
		collection.archiveId = archiveId as unknown as mongoose.Types.ObjectId
		// throw new Error('test')
		const found = await CollectionModel.find({ collectionname: collection.collectionname, archiveId }).exec()
		if (found.length > 0) {
			res.status(400).json({ error: 'collectionname already exists' })
			return
		}

		const newCollection = new CollectionModel(collection)
		const saved = await newCollection.save()
		res.status(201).json(JSON.parse(JSON.stringify(saved)))
		return
	}
	if (req.method === 'GET') {
		const collections = await CollectionModel.find({ archiveId }).exec()
		res.status(200).json([...collections])
	} else {
		res.status(500).json({ error: 'method not supported' })
	}
}

export default handler
