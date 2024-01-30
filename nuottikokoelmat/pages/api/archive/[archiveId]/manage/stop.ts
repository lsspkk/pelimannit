import { sessionOptions } from '@/models/session'
import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'

async function logoutRoute (req: NextApiRequest, res: NextApiResponse) {
	req.session.archiveUser = undefined
	await req.session.save()

	res.status(200).json({ message: 'logged out' })
}

export default withIronSessionApiRoute(logoutRoute, sessionOptions)
