import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../models/dbConnect'
import { Archive, ArchiveModel } from '../../../models/archive'
import { hasApi, secureFetch } from '../config'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    if (hasApi('/api/archive/search')) {
      await apiHandler(req, res)
    } else {
      await mongoHandler(req, res)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

const apiHandler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method === 'POST') {
    const response = await secureFetch(`/api/v1/archive/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })
    const json = await response.json()
    console.log(`POST /api/v1/archive/search`, { json })
    res.status(response.status).json(json)
  } else {
    res.status(500).json({ error: 'method not supported' })
  }
}

const mongoHandler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method === 'POST') {
    await dbConnect()
    const search: Archive = req.body as Archive
    const found = await ArchiveModel.find({ archivename: search.archivename }).exec()
    res.status(200).json(found)
  } else {
    res.status(500).json({ error: 'method not supported' })
  }
}
