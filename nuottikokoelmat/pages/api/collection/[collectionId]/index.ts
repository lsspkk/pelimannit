import { Collection, CollectionModel } from '../../../../models/collection'

import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../../models/dbConnect'
import { ChoiceModel } from '@/models/choice'
import { hasApi, secureFetch } from '../../config'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const collectionId = req.query.collectionId as string
  if (!collectionId) {
    res.status(400).json({ error: 'collectionId missing' })
    return
  }

  try {
    if (hasApi('/api/collection/:collectionId')) {
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
  if (req.method === 'PUT') {
    const response = await secureFetch(`/api/v1/collection/${collectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })
    const json = await response.json()
    res.status(response.status).json(json)
  } else if (req.method === 'GET') {
    const response = await secureFetch(`/api/v1/collection/${collectionId}`)
    const json = await response.json()
    res.status(response.status).json(json)
  } else if (req.method === 'DELETE') {
    const response = await secureFetch(`/api/v1/collection/${collectionId}`, {
      method: 'DELETE',
    })
    const json = await response.json()
    res.status(response.status).json(json)
  } else {
    res.status(500).json({ error: 'method not supported' })
  }
}

const mongoHandler = async (req: NextApiRequest, res: NextApiResponse, collectionId: string): Promise<void> => {
  await dbConnect()
  if (req.method === 'PUT') {
    const collection: Collection | null = await CollectionModel.findById(collectionId).exec()

    if (!collection) {
      res.status(401).json({ error: `nuottiarkistoa ${collectionId} ei löydy` })
    } else {
      console.log('updating collection', collection)
      CollectionModel.findByIdAndUpdate(collectionId, req.body, { new: true }).exec()
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
  if (req.method === 'DELETE') {
    console.debug('DELETE collection', collectionId)

    const choices = await ChoiceModel.deleteMany({ collectionId }).exec()
    console.debug('deleted choices', choices)

    const collection = await CollectionModel.findByIdAndDelete(collectionId).exec()
    res.status(200).json(collection)
  } else {
    res.status(500).json({ error: 'method not supported' })
  }
}
