import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../models/dbConnect'
import { Choice, ChoiceModel } from '../../models/choice'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    await dbConnect()

    if (req.method === 'POST') {
      const choice = req.body as Choice
      const newChoice = new ChoiceModel(choice)
      const saved = await newChoice.save()
      res.status(201).json(saved)
    } else {
      res.status(500).json({ error: 'method not supported' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
