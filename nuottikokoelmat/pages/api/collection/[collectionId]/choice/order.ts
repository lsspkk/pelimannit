import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../../../models/dbConnect'
import { ChoiceModel, ChoiceOrder } from '../../../../../models/choice'
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

    if (hasApi('/api/collection/:collectionId/choice/order')) {
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
    const response = await secureFetch(`/api/v1/collection/${collectionId}/choice/order`, {
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
  await dbConnect()

  if (req.method === 'POST') {
    const choices = await ChoiceModel.find({ collectionId }).exec()
    const choiceOrder: ChoiceOrder[] = req.body
    const choiceOrderMap = new Map<string, number>()
    choiceOrder.forEach((choice) => {
      choiceOrderMap.set(String(choice.songId), choice.index)
    })
    const objectsToUpdate = []

    for (const choice of choices) {
      const index = choiceOrderMap.get(String(choice.songId))
      if (index !== choice.index) {
        objectsToUpdate.push({ _id: choice._id, index })
      }
    }

    const bulkOps = objectsToUpdate.map((choice) => ({
      updateOne: {
        filter: { _id: choice._id },
        update: { index: choice.index },
      },
    }))
    const saved = await ChoiceModel.bulkWrite(bulkOps)
    res.status(201).json(JSON.parse(JSON.stringify(saved)))
  } else {
    res.status(500).json({ error: 'method not supported' })
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)
