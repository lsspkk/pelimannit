import { Archive, ArchiveModel } from '../../../../models/archive'

import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../../models/dbConnect'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { archiveId } = req.query
  if (!archiveId) {
    res.status(400).json({ error: 'archiveId missing' })
    return
  }
  const id = typeof archiveId === 'string' ? archiveId : archiveId[0]

  try {
    await dbConnect()
    if (req.method === 'PUT') {
      const archive: Archive | null = await ArchiveModel.findById(id).exec()

      if (!archive) {
        res.status(401).json({ error: `nuottiarkistoa ${id} ei löydy` })
      } else {
        console.log('updating archive', archive)
        ArchiveModel.findByIdAndUpdate(id, req.body, { new: true }).exec()
        res.status(200).json(archive)
      }
    }
    if (req.method === 'GET') {
      console.debug('GET archive', archiveId)
      const archives: Array<Archive> = await ArchiveModel.find({
        _id: archiveId,
      }).exec()
      if (archives.length !== 1) {
        res.status(404).json({})
        return
      }
      console.debug('---------------', archives)
      const archive = JSON.parse(JSON.stringify(archives[0]))
      res.status(200).json(archive)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
