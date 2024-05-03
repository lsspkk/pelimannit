import { ArchiveUser } from '@/models/archiveUser'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '../../auth'

async function handler (req: NextApiRequest, res: NextApiResponse<ArchiveUser>) {
	const session = await getSession(req, res)
	if (session.archiveUser) {
		res.json(session.archiveUser)
	} else {
		res.json({ username: '', archiveId: '', role: '' })
	}
}

export default handler
