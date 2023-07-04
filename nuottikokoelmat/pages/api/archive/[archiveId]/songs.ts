import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/models/dbConnect'
import { SongModel } from '@/models/song'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { archiveId } = req.query
  if (!archiveId) {
    res.status(400).json({ error: 'archiveId missing' })
    return
  }
  const id = typeof archiveId === 'string' ? archiveId : archiveId[0]

  try {
    await dbConnect()
    if (req.method === 'GET') {
      console.debug('GET archive', archiveId)
      const songs = await SongModel.find({ archiveId: id }).exec()
      res.status(200).json([...songs])
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}