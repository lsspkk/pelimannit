import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from '@/models/session'
import { NextApiRequest, NextApiResponse } from 'next'

async function logoutRoute(req: NextApiRequest, res: NextApiResponse) {
  const archiveId = req.session.archiveUser?.archiveId
  if (!archiveId) {
    req.session.destroy()
    res.status(200).json({ message: 'logged out' })
    return
  }

  req.session.archiveVisitor = { archiveId }
  delete req.session.archiveUser
  await req.session.save()
  res.status(200).json({ message: 'logged out, now a visitor' })
}

export default withIronSessionApiRoute(logoutRoute, sessionOptions)
