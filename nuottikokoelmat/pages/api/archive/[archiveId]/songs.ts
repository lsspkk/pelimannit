import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/models/dbConnect'
import { SongModel } from '@/models/song'
import { sessionOptions } from '@/models/session'
import { withIronSessionApiRoute } from 'iron-session/next'
import { hasApi, secureFetch } from '../../config'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const archiveId = req.query.archiveId as string
  if (!archiveId) {
    res.status(400).json({ error: 'archiveId missing' })
    return
  }
  if (req.session?.archiveVisitor?.archiveId !== archiveId) {
    res.status(401).json({ error: 'not logged in' })
    return
  }

  try {
    if (hasApi('/api/archive/:archiveId/songs')) {
      await apiHandler(req, res, archiveId)
    } else {
      await mongoHandler(req, res, archiveId)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

const apiHandler = async (req: NextApiRequest, res: NextApiResponse, archiveId: string): Promise<void> => {
  if (req.method === 'GET') {
    const response = await secureFetch(`/api/v1/archive/${archiveId}/songs`)
    const json = await response.json()
    res.status(response.status).json(json)
  } else {
    res.status(500).json({ error: 'method not supported' })
  }
}

const mongoHandler = async (req: NextApiRequest, res: NextApiResponse, archiveId: string): Promise<void> => {
  await dbConnect()
  if (req.method === 'GET') {
    console.debug('GET archive', archiveId)
    const songs = (await SongModel.find({ archiveId }).exec()).sort((a, b) => {
      return a.path.localeCompare(b.path) * -1 || a.songname.localeCompare(b.songname)
    })
    res.status(200).json([...songs])
  } else {
    res.status(500).json({ error: 'method not supported' })
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)
