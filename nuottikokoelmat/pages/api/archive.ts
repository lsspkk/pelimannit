import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../models/dbConnect'
import { Archive, ArchiveModel } from '../../models/archive'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    await dbConnect()

    if (req.method === 'POST') {
      const { createPassword, ...archive } = req.body as Archive & { createPassword: string }

      if (createPassword !== process.env.CREATE_PASSWORD || !createPassword) {
        res.status(401).json({ error: 'wrong password' })
        return
      }

      const found = await ArchiveModel.find({ archivename: archive.archivename }).exec()
      if (found.length > 0) {
        res.status(400).json({ error: 'archivename already exists' })
        return
      }

      const newArchive = new ArchiveModel(archive)
      const saved = await newArchive.save()
      res.status(201).json(saved)
    }
    if (req.method === 'GET') {
      const archives = await ArchiveModel.find({}).exec()
      res.status(200).json([...archives])
    } else {
      res.status(500).json({ error: 'method not supported' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
