import type { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
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
      //https://drive.google.com/drive/folders/1I1oqb0G61WaF_j3pdKwvf7ymbXJ-7N5K?usp=drive_link
      const response = await drive.files.list()

      const files = response.data.files

      if (files) {
        res.status(200).json(files)
        return
      }

      res.status(500).json({ error: 'no files found' })
    } else {
      res.status(500).json({ error: 'method not supported' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

const SCOPES = ['https://www.googleapis.com/auth/drive']

async function getClient() {
  try {
    return new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), '.') + '/credentials.json',
      scopes: SCOPES,
    })
  } catch (error) {
    console.log(error)
  }
  return null
}
