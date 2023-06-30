import { Collection, CollectionModel } from '../../../../models/collection'

import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../../models/dbConnect'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { collectionId } = req.query
  if (!collectionId) {
    res.status(400).json({ error: 'collectionId missing' })
    return
  }
  const id = typeof collectionId === 'string' ? collectionId : collectionId[0]

  try {
    await dbConnect()
    if (req.method === 'PUT') {
      const collection: Collection | null = await CollectionModel.findById(id).exec()

      if (!collection) {
        res.status(401).json({ error: `nuottiarkistoa ${id} ei löydy` })
      } else {
        console.log('updating collection', collection)
        CollectionModel.findByIdAndUpdate(id, req.body, { new: true }).exec()
        res.status(200).json(collection)
      }
    }
    if (req.method === 'GET') {
      console.debug('GET collection', collectionId)
      const collections: Array<Collection> = await CollectionModel.find({
        _id: collectionId,
      }).exec()
      if (collections.length !== 1) {
        res.status(404).json({})
        return
      }
      const collection = JSON.parse(JSON.stringify(collections[0]))
      res.status(200).json(collection)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
