import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/models/dbConnect'
import { ChoiceModel } from '@/models/choice'
import { hasApi, secureFetch } from '../../config'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const collectionId = req.query.collectionId as string
  if (!collectionId) {
    res.status(400).json({ error: 'collectionId missing' })
    return
  }

  try {
    if (hasApi('/api/collection/:collectionId/choices')) {
      await apiHandler(req, res, collectionId)
    } else {
      await mongoHandler(req, res, collectionId)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

const apiHandler = async (req: NextApiRequest, res: NextApiResponse, collectionId: string): Promise<void> => {
  if (req.method === 'GET') {
    const response = await secureFetch(`/api/v1/collection/${collectionId}/choices`)
    const json = await response.json()
    res.status(response.status).json(json)
  } else {
    res.status(500).json({ error: 'method not supported' })
  }
}

const mongoHandler = async (req: NextApiRequest, res: NextApiResponse, collectionId: string): Promise<void> => {
  await dbConnect()
  if (req.method === 'GET') {
    console.debug('GET choices for collection', collectionId)
    const choices = await ChoiceModel.find({ collectionId }).exec()
    res.status(200).json([...choices])
  } else {
    res.status(500).json({ error: 'method not supported' })
  }
}
