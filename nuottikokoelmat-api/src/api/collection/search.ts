import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../models/dbConnect'
import { Archive, ArchiveModel } from '../../../models/archive'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    await dbConnect()

    if (req.method === 'POST') {
      const search: Archive = req.body as Archive
      const found = await ArchiveModel.find({ archivename: search.archivename })
      res.status(200).json(found)
    } else {
      res.status(500).json({ error: 'method not supported' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
