import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../../models/dbConnect'
import { Collection, CollectionModel } from '../../../../models/collection'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    const { archiveId } = req.query
    if (!archiveId) {
      res.status(400).json({ error: 'archiveId missing' })
      return
    }
    const id = typeof archiveId === 'string' ? archiveId : archiveId[0]

    await dbConnect()

    if (req.method === 'POST') {
      const collection = req.body as Collection

      const found = await CollectionModel.find({ collectionname: collection.collectionname, archiveId: id }).exec()
      if (found.length > 0) {
        res.status(400).json({ error: 'collectionname already exists' })
        return
      }

      const newCollection = new CollectionModel(collection)
      const saved = await newCollection.save()
      res.status(201).json(saved)
    }
    if (req.method === 'GET') {
      const collections = await CollectionModel.find({}).exec()
      res.status(200).json([...collections])
    } else {
      res.status(500).json({ error: 'method not supported' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
