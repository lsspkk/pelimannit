import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/models/dbConnect'
import { SongModel } from '@/models/song'
import { sessionOptions } from '@/models/session'
import { withIronSessionApiRoute } from 'iron-session/next'
import { google } from 'googleapis'
import { isArchiveVisitor } from '@/pages/api/auth'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (!req.query.id) {
    res.status(400).json({ error: 'id missing' })
    return
  }

  if (!isArchiveVisitor(req, res)) {
    return
  }
  const id = typeof req.query.id === 'string' ? req.query.id : req.query.id[0]

  try {
    if (req.method === 'GET') {
      await dbConnect()
      const song = await SongModel.findById(id).exec()
      if (!song) {
        res.status(404).json({ error: 'not found' })
        return
      }
      console.log('GET song pdf from url', song.url)
      const fileId = song.url.split('/')[5].split('?')[0]
      const client = await getClient()

      if (!client) {
        res.status(500).json({ error: 'no client' })
        return
      }

      const drive = google.drive({ version: 'v3', auth: client })
      const response = await drive.files.get({ fileId: fileId, alt: 'media' }, { responseType: 'stream' })

      if (!response.data) {
        res.status(500).json({ error: 'no data' })
        return
      }

      res.setHeader('content-disposition', `attachment; filename="${song.songname}.pdf"`)
      response.data.pipe(res)
    } else {
      res.status(500).json({ error: 'method not supported' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
const keyJson = Buffer.from(process.env.CREDENTIALS_BASE64 || '', 'base64').toString('ascii')

async function getClient() {
  try {
    return new google.auth.GoogleAuth({
      credentials: JSON.parse(keyJson),
      scopes: SCOPES,
    })
  } catch (error) {
    console.log(error)
  }
  return null
}

export default withIronSessionApiRoute(handler, sessionOptions)
