import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../../models/dbConnect'
import { Collection, CollectionModel } from '../../../../models/collection'
import mongoose from 'mongoose'
import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from '@/models/session'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    const { archiveId } = req.query
    if (!archiveId) {
      res.status(400).json({ error: 'archiveId missing' })
      return
    }
    const id = typeof archiveId === 'string' ? archiveId : archiveId[0]

    await dbConnect()

    if (req.method === 'POST') {
      if (req.session.archiveUser?.archiveId !== id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const collection = req.body as Collection
      collection.archiveId = id as unknown as mongoose.Types.ObjectId
      // throw new Error('test')
      const found = await CollectionModel.find({ collectionname: collection.collectionname, archiveId: id }).exec()
      if (found.length > 0) {
        res.status(400).json({ error: 'collectionname already exists' })
        return
      }

      const newCollection = new CollectionModel(collection)
      const saved = await newCollection.save()
      res.status(201).json(JSON.parse(JSON.stringify(saved)))
    }
    if (req.method === 'GET') {
      const collections = await CollectionModel.find({ archiveId }).exec()
      res.status(200).json([...collections])
    } else {
      res.status(500).json({ error: 'method not supported' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)
