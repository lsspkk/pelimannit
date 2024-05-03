import { getSession } from '@/pages/api/auth'
import { NextApiRequest, NextApiResponse } from 'next'

async function handler (req: NextApiRequest, res: NextApiResponse) {
	const { archiveId } = req.query
	if (!archiveId) {
		res.status(400).json({ error: 'archiveId missing' })
		return
	}
	const session = await getSession(req, res)
	session.archiveVisitor = undefined
	await session.save()

	res.status(200).json({ message: 'ok' })
}

export default handler
