import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../../../models/dbConnect'
import { ChoiceModel, ChoiceOrder } from '../../../../../models/choice'
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
      const choices = await ChoiceModel.find({ collectionId: id }).exec()
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
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
