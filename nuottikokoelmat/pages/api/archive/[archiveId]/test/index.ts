import { Archive, ArchiveModel } from '@/models/archive'

import { dbConnect } from '@/models/dbConnect'
import type { NextApiRequest, NextApiResponse } from 'next'

async function handler (req: NextApiRequest, res: NextApiResponse): Promise<void> {
	const { archiveId } = req.query
	if (!archiveId) {
		res.status(400).json({ error: 'archiveId missing' })
		return
	}

	if (!process.env.CREATE_PASSWORD) {
		res.status(401).json({ error: 'go away' })
		return
	}

	try {
		await dbConnect()
		if (req.method === 'GET') {
			const archives: Array<Archive> = await ArchiveModel.find({ _id: archiveId }).exec()
			if (archives.length !== 1) {
				res.status(404).json({})
				return
			}
			const archive = JSON.parse(JSON.stringify(archives[0]))
			res.status(200).json(archive)
		}
	} catch (error) {
		console.log(error)
		res.status(500).json({ error })
	}
}
export default handler
