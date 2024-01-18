// backend for testing google drive api

import type { NextApiRequest, NextApiResponse } from 'next'
import { drive_v3, google } from 'googleapis'
import { getAuth } from '../getAuth'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  parents: string[]
  children: DriveFile[]
}
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
      const response = await drive.files.list({ q: `'${fileId}' in parents and trashed=false` })

      if (!response.data?.files) {
        res.status(500).json({ error: 'no data' })
        return
      }
      await buildTree(drive, response.data.files)

      res.status(200).json(response.data.files)
    } else {
      res.status(500).json({ error: 'method not supported' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
async function buildTree(drive: drive_v3.Drive, files: import('googleapis').drive_v3.Schema$File[]) {
  for (const file of files as DriveFile[]) {
    if (file.mimeType !== 'application/vnd.google-apps.folder') {
      continue
    }

    const r = await drive.files.list({ q: `'${file.id}' in parents and trashed=false` })
    file.children = (r.data.files as DriveFile[]) || []
    await buildTree(drive, file.children)
  }
}
