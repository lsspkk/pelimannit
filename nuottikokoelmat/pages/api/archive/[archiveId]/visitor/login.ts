import { ArchiveModel } from '@/models/archive'
import { dbConnect } from '@/models/dbConnect'
import { getSession } from '@/pages/api/auth'
import { hasApi, secureFetch } from '@/pages/api/config'
import { get } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'

async function handler (req: NextApiRequest, res: NextApiResponse) {
	const archiveId = req.query.archiveId as string
	if (!archiveId) {
		res.status(400).json({ error: 'archiveId missing' })
		return
	}

	const { visitorPassword } = await req.body
	console.debug('start visiting archive', { archiveId, timestamp: Date.now() })
	try {
		if (hasApi('/api/archive/:archiveId/visitor/login')) {
			await apiHandler(req, res, archiveId, visitorPassword)
		} else {
			await mongoHandler(req, res, archiveId, visitorPassword)
		}
	} catch (error) {
		res.status(500).json({ message: (error as Error).message })
	}
}

const apiHandler = async (req: NextApiRequest, res: NextApiResponse, archiveId: string, visitorPassword: string): Promise<void> => {
	if (req.method === 'POST') {
		const response = await secureFetch(`/api/v1/archive/${archiveId}/visitor/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ visitorPassword }),
		})
		const session = await getSession(req, res)
		session.archiveVisitor = { archiveId }
		await session.save()

		const json = await response.json()
		res.status(response.status).json(json)
	} else {
		res.status(500).json({ message: 'method not supported' })
	}
}

const mongoHandler = async (req: NextApiRequest, res: NextApiResponse, archiveId: string, visitorPassword: string): Promise<void> => {
	dbConnect()
	const archive = await ArchiveModel.findById(archiveId).exec()
	if (!archive) {
		res.status(401).json({ message: `Archive ${archiveId} not found` })
		return
	}
	if (archive.visitorPassword !== visitorPassword) {
		res.status(401).json({ message: 'Unauthorized, wrong password' })
		return
	}
	const session = await getSession(req, res)
	session.archiveVisitor = { archiveId }
	await session.save()

	res.status(200).json({ message: 'ok' })
}

export default handler
