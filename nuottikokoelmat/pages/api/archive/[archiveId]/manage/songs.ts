import { ArchiveRole } from '@/models/archiveUser'
import { dbConnect } from '@/models/dbConnect'
import { sessionOptions } from '@/models/session'
import { Song, SongModel } from '@/models/song'
import { hasArchiveAuth } from '@/pages/api/auth'
import { withIronSessionApiRoute } from 'iron-session/next'
import type { NextApiRequest, NextApiResponse } from 'next'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (!hasArchiveAuth(req, res, ArchiveRole.MANAGER)) {
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

export default withIronSessionApiRoute(handler, sessionOptions)
