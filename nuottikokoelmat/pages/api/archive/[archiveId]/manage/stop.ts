import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from '@/models/session'
import { NextApiRequest, NextApiResponse } from 'next'

function logoutRoute(req: NextApiRequest, res: NextApiResponse) {
  req.session.destroy()
  res.send({ username: '', archiveId: '' })
}

export default withIronSessionApiRoute(logoutRoute, sessionOptions)
