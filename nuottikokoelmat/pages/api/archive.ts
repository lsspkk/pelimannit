import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../models/dbConnect'
import { Archive, ArchiveModel } from '../../models/archive'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    await dbConnect()

    if (req.method === 'POST') {
      const archive = req.body as Archive
      console.debug('-------------', 'archive')

      // const foundArchivename = await ArchiveModel.find({ archivename: archive.archivename }).exec()
      // if (foundArchivename) {
      //   res.status(400).json({ error: 'archivename already exists' })
      //   return
      // }
      console.debug('-------------', '1')
      const newArchive = new ArchiveModel(archive)
      console.debug('-------------', '1')
      const saved = await newArchive.save()
      console.debug('-------------', saved)
      res.status(201).json(saved)
    } else {
      res.status(500).json({ error: 'method not supported' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
