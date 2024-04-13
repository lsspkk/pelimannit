import { dbConnect } from '@/models/dbConnect'
import { Song, SongModel } from '@/models/song'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const archiveId = req.query.archiveId as string
  if (!archiveId) {
    res.status(400).json({ error: 'archiveId missing' })
    return
  }

  if ((!req.session?.archiveUser || req.session?.archiveUser.archiveId !== archiveId) && !process.env.CREATE_PASSWORD) {
    res.status(401).json({ error: 'not authorized' })
    return
  }

  try {
    if (req.method === 'POST') {
      console.debug('POST songs, with role', req.session?.archiveUser?.role || 'no role')
      await dbConnect()

      const songs = req.body as Song[]
      const newSongs = songs.map((song) => new SongModel(song))
      const saved = await SongModel.insertMany(newSongs)
      res.status(201).json(saved)
    } else {
      res.status(500).json({ error: 'method not supported' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
