import { ArchiveRole } from '@/models/archiveUser'
import { sessionOptions } from '@/models/session'
import { SongLite } from '@/models/song'
import { buildSongCompare, defaultSortSettings } from '@/models/sortSettings'
import { hasArchiveAuth, driveAuth } from '@/pages/api/auth'
import { readFile } from 'fs/promises'
import { drive_v3, google } from 'googleapis'
import { withIronSessionApiRoute } from 'iron-session/next'
import type { NextApiRequest, NextApiResponse } from 'next'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  parents?: string[]
  children?: DriveFile[]
}

// loads google drive tree from a file for development purposes
const getDevelopmentTree = async () => {
  const file = process.env.DEVELOPMENT_TREE_FILE
  if (!file) {
    return undefined
  }
  const tree = await readFile(file, { encoding: 'utf-8' })
  return JSON.parse(tree) as DriveFile[]
}

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (!hasArchiveAuth(req, res, ArchiveRole.MANAGER)) {
    return
  }
  const folderId = req.query.id as string

  const returnDevelopmentTree = req.query.developmentTree === 'true'

  try {
    if (req.method === 'GET') {
      const auth = await driveAuth()

      if (!auth) {
        res.status(500).json({ error: 'no client' })
        return
      }

      const tree = process.env.DEVELOPMENT_TREE_FILE
        ? await getDevelopmentTree()
        : await loadAndBuildTree(auth, folderId, res)

      if (returnDevelopmentTree) {
        res.status(200).json(tree)
        return
      }

      const songList = buildSongList('/', tree as DriveFile[], []).sort(buildSongCompare(defaultSortSettings))
      res.status(200).json(songList)
    } else {
      res.status(500).json({ error: 'method not supported' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
export default withIronSessionApiRoute(handler, sessionOptions)

// loads the tree of folders and files from Google Drive making many api calls
const loadAndBuildTree = async (auth: any, folderId: string, res: NextApiResponse) => {
  const drive = google.drive({ version: 'v3', auth })
  const response = await drive.files.list({ q: `'${folderId}' in parents and trashed=false` })

  if (!response.data?.files) {
    res.status(500).json({ error: 'no data' })
    return undefined
  }
  const files = response.data.files as DriveFile[]
  await buildTree(drive, files)
  return files
}

async function buildTree(drive: drive_v3.Drive, files: import('googleapis').drive_v3.Schema$File[]) {
  for (const file of files as DriveFile[]) {
    if (file.mimeType !== 'application/vnd.google-apps.folder') {
      continue
    }

    const r = await drive.files.list({ q: `'${file.id}' in parents and trashed=false` })

    // console.debug('buildTree', file.id, file.name, r.data.files)
    file.children = (r.data.files as DriveFile[]) || []
    await buildTree(drive, file.children)
  }
}

function buildSongList(parentPath: string, driveFiles: DriveFile[], songs: SongLite[] = []) {
  for (const file of driveFiles) {
    if (file.mimeType === 'application/vnd.google-apps.folder' && file.children) {
      for (const child of file.children) {
        buildSongList(`${parentPath}${file.name}/`, [child], songs)
      }
    } else {
      // console.debug(file.id, file.name, parentPath)
      songs.push({ songname: file.name, path: parentPath, url: makeGoogleViewUrl(file.id) })
    }
  }
  return songs
}

function makeGoogleViewUrl(id: string) {
  return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`
}
