import { getSession } from '@/pages/api/auth'
import { NextApiRequest, NextApiResponse } from 'next'

async function handler (req: NextApiRequest, res: NextApiResponse) {
	const session = await getSession(req, res)
	res.setHeader('Cache-Control', 'no-store')

	const archiveId = session.archiveUser?.archiveId
	if (!archiveId) {
		session.destroy()
		res.status(200).json({ message: 'logged out' })
		return
	}

	session.archiveVisitor = { archiveId }
	delete session.archiveUser
	await session.save()
	res.status(200).json({ message: 'logged out, now a visitor' })
}

export default handler
