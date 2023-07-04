import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../../../models/dbConnect'
import { ChoiceModel } from '../../../../../models/choice'
import { Types } from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    const { collectionId } = req.query
    if (!collectionId) {
      res.status(400).json({ error: 'collectionId missing' })
      return
    }
    const id = typeof collectionId === 'string' ? collectionId : collectionId[0]

    await dbConnect()

    if (req.method === 'POST') {
      const created = new Date()
      const songIds = req.body as Types.ObjectId[]
      const newChoices = songIds.map((songId) => new ChoiceModel({ songId, collectionId: id, created }))
      const saved = await ChoiceModel.insertMany(newChoices)
      res.status(201).json(saved)
    } else {
      res.status(500).json({ error: 'method not supported' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}