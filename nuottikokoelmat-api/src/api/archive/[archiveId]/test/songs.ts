import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/models/dbConnect'
import { SongModel } from '@/models/song'
import { sessionOptions } from '@/models/session'
import { withIronSessionApiRoute } from 'iron-session/next'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { archiveId } = req.query
  if (!archiveId) {
    res.status(400).json({ error: 'archiveId missing' })
    return
  }
  if (!process.env.CREATE_PASSWORD) {
    res.status(401).json({ error: 'go away' })
    return
  }

  try {
    await dbConnect()
    if (req.method === 'GET') {
      const songs = (await SongModel.find({ archiveId }).exec()).sort((a, b) => {
        return a.path.localeCompare(b.path) * -1 || a.songname.localeCompare(b.songname)
      })
      res.status(200).json([...songs])
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)
