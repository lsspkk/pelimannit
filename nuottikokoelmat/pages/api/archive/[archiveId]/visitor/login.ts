import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { sessionOptions } from '@/models/session'
import bcrypt from 'bcrypt'
import { ArchiveModel } from '@/models/archive'

async function startManageRoute(req: NextApiRequest, res: NextApiResponse) {
  const { archiveId } = req.query
  if (!archiveId) {
    res.status(400).json({ error: 'archiveId missing' })
    return
  }
  const id = typeof archiveId === 'string' ? archiveId : archiveId[0]

  const { visitorPassword } = await req.body
  console.debug('start visiting', { archiveId, visitorPassword })
  try {
    const archive = await ArchiveModel.findById(id).exec()
    if (!archive) {
      res.status(401).json({ message: `Archive ${id} not found` })
      return
    }
    console.debug({ archive, visitorPassword })
    if (archive.visitorPassword !== visitorPassword) {
      res.status(401).json({ message: 'Unauthorized, wrong password' })
      return
    }
    req.session.archiveVisitor = { archiveId: id }
    await req.session.save()

    res.status(200).json({ message: 'ok' })
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}

export default withIronSessionApiRoute(startManageRoute, sessionOptions)
