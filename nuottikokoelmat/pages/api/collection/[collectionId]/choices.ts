import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/models/dbConnect'
import { ChoiceModel } from '@/models/choice'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { collectionId } = req.query
  if (!collectionId) {
    res.status(400).json({ error: 'collectionId missing' })
    return
  }
  const id = typeof collectionId === 'string' ? collectionId : collectionId[0]

  try {
    await dbConnect()
    if (req.method === 'GET') {
      console.debug('GET songs for collection', id)
      const choices = await ChoiceModel.find({ collectionId: id }).exec()
      res.status(200).json([...choices])
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
