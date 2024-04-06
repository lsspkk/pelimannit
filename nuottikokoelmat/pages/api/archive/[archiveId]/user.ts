import { ArchiveUser } from '@/models/archiveUser'
import { sessionOptions } from '@/models/session'
import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'

async function userRoute (req: NextApiRequest, res: NextApiResponse<ArchiveUser>) {
	if (req.session.archiveUser) {
		res.json(req.session.archiveUser)
	} else {
		res.json({ username: '', archiveId: '', role: '' })
	}
}

export default withIronSessionApiRoute(userRoute, sessionOptions)
