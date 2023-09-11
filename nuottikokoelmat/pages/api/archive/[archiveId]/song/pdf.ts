import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/models/dbConnect'
import { Song, SongModel } from '@/models/song'
import { sessionOptions } from '@/models/session'
import { withIronSessionApiRoute } from 'iron-session/next'
import { Readable, pipeline } from 'stream'
import axios from 'axios'
import { google } from 'googleapis'
import path from 'path'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { archiveId } = req.query
  if (!archiveId) {
    res.status(400).json({ error: 'archiveId missing' })
    return
  }
  const id = typeof archiveId === 'string' ? archiveId : archiveId[0]
  if (req.session?.archiveVisitor?.archiveId !== id) {
    res.status(401).json({ error: 'not logged in' })
    return
  }
  try {
    if (req.method === 'POST') {
      const song = req.body as Song
      if (!song.url) {
        res.status(400).json({ error: 'url missing' })
        return
      }

      const url = song.url
      const fileId = url.split('/')[5].split('?')[0]
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
