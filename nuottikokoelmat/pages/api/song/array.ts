import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../models/dbConnect'
import { Song, SongModel } from '../../../models/song'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    await dbConnect()

    if (req.method === 'POST') {
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
