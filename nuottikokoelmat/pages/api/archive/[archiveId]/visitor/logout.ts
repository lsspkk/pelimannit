import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { sessionOptions } from '@/models/session'

async function startManageRoute(req: NextApiRequest, res: NextApiResponse) {
  const { archiveId } = req.query
  if (!archiveId) {
    res.status(400).json({ error: 'archiveId missing' })
    return
  }

  req.session.archiveVisitor = undefined
  await req.session.save()

  res.status(200).json({ message: 'ok' })
}

export default withIronSessionApiRoute(startManageRoute, sessionOptions)
