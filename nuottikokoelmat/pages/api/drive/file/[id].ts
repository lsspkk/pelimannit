// backend for testing google drive api

import type { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const fileId = req.query.id as string

  try {
    if (req.method === 'GET') {
      if (!process.env.CREATE_PASSWORD) {
        res.status(401).json({ error: 'go away' })
        return
      }

      const client = await getClient()

      if (!client) {
        res.status(500).json({ error: 'no client' })
        return
      }

      const drive = google.drive({ version: 'v3', auth: client })
      const response = await drive.files.get({ fileId: fileId, alt: 'media' }, { responseType: 'stream' })
      response.data.pipe(res)

      res.status(200)
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
