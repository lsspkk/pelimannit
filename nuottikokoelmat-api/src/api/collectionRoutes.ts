import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { Collection, CollectionModel } from '@/models/collection'
import mongoose from 'mongoose'

interface ArchiveId {
  Params: {
    archiveId: string
  }
}

interface CollectionId {
  Params: {
    collectionId: string
  }
}

export const collectionRoutes: FastifyPluginAsync<{ prefix: string }> = async (fastify: FastifyInstance) => {
  fastify.get<ArchiveId>('/api/v1/archive/:archiveId/collection', {}, async (request, reply) => {
    try {
      const { archiveId } = request.params
      const collections = await CollectionModel.find({ archiveId }).exec()
      const archive = JSON.parse(JSON.stringify([...collections]))
      return reply.code(200).send(archive)
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })

  fastify.post<ArchiveId>('/api/v1/archive/:archiveId/collection', {}, async (request, reply) => {
    try {
      const { archiveId } = request.params
      const collection = request.body as Collection
      collection.archiveId = archiveId as unknown as mongoose.Types.ObjectId

      const found = await CollectionModel.find({ collectionname: collection.collectionname, archiveId }).exec()
      if (found.length > 0) {
        reply.code(400).send({ error: 'collectionname already exists' })
        return
      }

      const newCollection = new CollectionModel(collection)
      const saved = await newCollection.save()
      return reply.code(201).send(JSON.parse(JSON.stringify(saved)))
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })

  fastify.get<CollectionId>('/api/v1/collection/:collectionId', {}, async (request, reply) => {
    try {
      console.debug(request.headers.authorization)
      const collectionId = request.params.collectionId
      const collections: Array<Collection> = await CollectionModel.find({
        _id: collectionId,
      }).exec()
      if (collections.length !== 1) {
        reply.code(404).send({})
        return
      }
      const collection = JSON.parse(JSON.stringify(collections[0]))
      return reply.code(200).send(collection)
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })

  fastify.put<CollectionId>('/api/v1/collection/:collectionId', {}, async (request, reply) => {
    try {
      const collectionId = request.params.collectionId
      const collection: Collection | null = await CollectionModel.findById(collectionId).exec()

      if (!collection) {
        reply.code(401).send({ error: `nuottiarkistoa ${collectionId} ei löydy` })
      } else {
        console.log('updating collection', collection)
        CollectionModel.findByIdAndUpdate(collectionId, request.body as Collection, { new: true }).exec()
        return reply.code(200).send(collection)
      }
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })

  fastify.delete<CollectionId>('/api/v1/collection/:collectionId', {}, async (request, reply) => {
    try {
      const collectionId = request.params.collectionId
      const collection: Collection | null = await CollectionModel.findById(collectionId).exec()

      if (!collection) {
        reply.code(401).send({ error: `nuottiarkistoa ${collectionId} ei löydy` })
      } else {
        console.log('deleting collection', collection)
        CollectionModel.findByIdAndDelete(collectionId).exec()
        return reply.code(200).send(collection)
      }
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })
}
