import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from '@/models/session'
import { NextApiRequest, NextApiResponse } from 'next'
import { ArchiveUser } from '@/models/archiveUser'

async function userRoute(req: NextApiRequest, res: NextApiResponse<ArchiveUser>) {
  if (req.session.archiveUser) {
    res.json(req.session.archiveUser)
  } else {
    res.json({ username: '', archiveId: '' })
  }
}

export default withIronSessionApiRoute(userRoute, sessionOptions)
