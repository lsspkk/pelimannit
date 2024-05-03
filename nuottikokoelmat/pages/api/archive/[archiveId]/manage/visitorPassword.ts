import { Archive, ArchiveModel } from '@/models/archive'

import { ArchiveRole } from '@/models/archiveUser'
import { dbConnect } from '@/models/dbConnect'
import { hasArchiveAuth } from '@/pages/api/auth'
import type { NextApiRequest, NextApiResponse } from 'next'

async function handler (req: NextApiRequest, res: NextApiResponse): Promise<void> {
	if (!await hasArchiveAuth(req, res, ArchiveRole.USER)) {
		return
	}
	const archiveId = req.query.archiveId as string

	try {
		await dbConnect()

		if (req.method === 'POST') {
			const archive: Archive | null = await ArchiveModel.findById(archiveId).exec()

			if (!archive) {
				res.status(401).json({ error: `nuottiarkistoa ${archiveId} ei löydy` })
			} else {
				console.log('updating archive', archive)
				archive.visitorPassword = req.body.visitorPassword
				const updatedArchive = await ArchiveModel.findByIdAndUpdate(archiveId, archive, { new: true }).exec()
				res.status(200).json(updatedArchive)
			}
		}
	} catch (error) {
		console.log(error)
		res.status(500).json({ error })
	}
}

export default handler
