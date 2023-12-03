import { Choice, ChoiceModel } from '@/models/choice'

import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/models/dbConnect'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { choiceId } = req.query
  if (!choiceId) {
    res.status(400).json({ error: 'choiceId missing' })
    return
  }
  const id = typeof choiceId === 'string' ? choiceId : choiceId[0]

  try {
    await dbConnect()
    if (req.method === 'PUT') {
      const choice: Choice | null = await ChoiceModel.findById(id).exec()

      if (!choice) {
        res.status(401).json({ error: `Lauluvalintaa ${id} ei löydy` })
      } else {
        console.log('updating choice', choice)
        ChoiceModel.findByIdAndUpdate(id, req.body, { new: true }).exec()
        res.status(200).json(choice)
      }
    } else if (req.method === 'GET') {
      console.debug('GET choice', choiceId)
      const choices: Array<Choice> = await ChoiceModel.find({
        _id: choiceId,
      }).exec()
      if (choices.length !== 1) {
        res.status(404).json({})
        return
      }
      const choice = JSON.parse(JSON.stringify(choices[0]))
      res.status(200).json(choice)
    } else if (req.method === 'DELETE') {
      console.debug('DELETE choice', choiceId)
      const choice: Choice | null = await ChoiceModel.findByIdAndDelete(id).exec()
      if (!choice) {
        res.status(404).json({})
        return
      }
      res.status(200).json(choice)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
