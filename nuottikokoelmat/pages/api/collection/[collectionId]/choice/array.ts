import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../../../models/dbConnect'
import { ChoiceModel } from '../../../../../models/choice'
import { Types } from 'mongoose'
import { sessionOptions } from '@/models/session'
import { withIronSessionApiRoute } from 'iron-session/next'
import { isAuthorized } from '@/pages/api/choice'
import { hasApi, secureFetch } from '@/pages/api/config'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    const collectionId = req.query.collectionId as string
    if (!collectionId) {
      res.status(400).json({ error: 'collectionId missing' })
      return
    }

    if (!isAuthorized(req, res)) {
      return
    }

    if (hasApi('/api/collection/:collectionId/choice/array')) {
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
  if (req.method === 'POST') {
    const response = await secureFetch(`/api/v1/collection/${collectionId}/choice/array`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })
    const json = await response.json()
    res.status(response.status).json(json)
  } else {
    res.status(500).json({ error: 'method not supported' })
  }
}

const mongoHandler = async (req: NextApiRequest, res: NextApiResponse, collectionId: string): Promise<void> => {
  if (req.method === 'POST') {
    await dbConnect()
    const created = new Date()
    const songIds = req.body as Types.ObjectId[]
    const newChoices = songIds.map((songId) => new ChoiceModel({ songId, collectionId, created }))
    const saved = await ChoiceModel.insertMany(newChoices)
    res.status(201).json(saved)
  } else {
    res.status(500).json({ error: 'method not supported' })
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)
