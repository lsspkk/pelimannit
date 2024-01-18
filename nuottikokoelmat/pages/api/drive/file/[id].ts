// backend for testing google drive api

import type { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'
import { getAuth } from '../getAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const fileId = req.query.id as string

  try {
    if (req.method === 'GET') {
      if (!process.env.CREATE_PASSWORD) {
        res.status(401).json({ error: 'go away' })
        return
      }

      const auth = await getAuth()

      if (!auth) {
        res.status(500).json({ error: 'no client' })
        return
      }

      const drive = google.drive({ version: 'v3', auth })
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
