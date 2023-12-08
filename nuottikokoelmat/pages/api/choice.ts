import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../models/dbConnect'
import { Choice, ChoiceModel } from '../../models/choice'
import { sessionOptions } from '@/models/session'
import { withIronSessionApiRoute } from 'iron-session/next'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    if (!isAuthorized(req, res)) {
      return
    }

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

export const isAuthorized = (req: NextApiRequest, res: NextApiResponse): boolean => {
  const archiveId = req.session?.archiveUser?.archiveId
  const authorized = archiveId !== undefined && archiveId !== ''
  if (!authorized) {
    res.status(401).json({ error: 'Unauthorized' })
  }
  return authorized
}

export default withIronSessionApiRoute(handler, sessionOptions)
