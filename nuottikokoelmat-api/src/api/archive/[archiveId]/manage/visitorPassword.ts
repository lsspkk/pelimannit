import { Archive, ArchiveModel } from '@/models/archive'

import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/models/dbConnect'
import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from '@/models/session'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { archiveId } = req.query
  if (!archiveId) {
    res.status(400).json({ error: 'archiveId missing' })
    return
  }
  const id = typeof archiveId === 'string' ? archiveId : archiveId[0]

  if (!req.session.archiveUser || req.session.archiveUser.archiveId !== id) {
    res.status(401).json({ error: 'not logged in' })
    return
  }

  try {
    await dbConnect()

    if (req.method === 'POST') {
      const archive: Archive | null = await ArchiveModel.findById(id).exec()

      if (!archive) {
        res.status(401).json({ error: `nuottiarkistoa ${id} ei löydy` })
      } else {
        console.log('updating archive', archive)
        archive.visitorPassword = req.body.visitorPassword
        const updatedArchive = await ArchiveModel.findByIdAndUpdate(id, archive, { new: true }).exec()
        res.status(200).json(updatedArchive)
      }
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)
