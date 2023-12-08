import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { ChoiceModel, Choice, ChoiceOrder } from '@/models/choice'
import { SongModel, Song } from '@/models/song'
import { Types } from 'mongoose'

interface CollectionId {
  Params: {
    collectionId: string
  }
}
function indexCompareFn(a: Song & { index?: number }, b: Song & { index?: number }): number {
  if ((a.index === -1 && b.index === -1) || a.index === b.index) {
    return 0
  }
  if (a.index === -1 || a.index === undefined) {
    return -1
  }
  if (b.index === -1 || b.index === undefined) {
    return 1
  }
  return a.index - b.index
}

export const collectionChoiceRoutes: FastifyPluginAsync<{ prefix: string }> = async (fastify: FastifyInstance) => {
  fastify.get<CollectionId>('/api/v1/collection/:collectionId/songs', {}, async (request, reply) => {
    try {
      const { collectionId } = request.params
      const choices: Choice[] = await ChoiceModel.find({ collectionId }).exec()
      if (choices.length === 0) {
        return reply.code(200).send([])
      }
      const indexMap = new Map<string, number | undefined>()
      choices.forEach((choice) => {
        indexMap.set(String(choice.songId), choice.index)
      })
      const songIds = choices.map((choice) => choice.songId)
      const songs: Song[] = await SongModel.find({ _id: { $in: songIds } }).exec()

      const songsWithIndex = songs.map((song: Song) => {
        const index = indexMap.get(String(song._id))
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return { ...song.toObject(), index }
      })
      const orderedSongs = songsWithIndex.sort(indexCompareFn).map((song: { index: number } & Song) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { index, ...rest } = song
        return rest
      })

      return reply.code(200).send(orderedSongs)
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })

  fastify.get<CollectionId>('/api/v1/collection/:collectionId/choices', {}, async (request, reply) => {
    try {
      const { collectionId } = request.params
      const choices = await ChoiceModel.find({ collectionId }).exec()
      return reply.code(200).send(choices)
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })

  fastify.post<CollectionId>('/api/v1/collection/:collectionId/choice/array', {}, async (request, reply) => {
    try {
      const { collectionId } = request.params
      const created = new Date()
      const songIds = request.body as Types.ObjectId[]
      const newChoices = songIds.map((songId) => new ChoiceModel({ songId, collectionId, created }))
      const saved = await ChoiceModel.insertMany(newChoices)
      return reply.code(200).send(saved)
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })

  fastify.post<CollectionId>('/api/v1/collection/:collectionId/choice/order', {}, async (request, reply) => {
    try {
      const { collectionId } = request.params
      const choices = await ChoiceModel.find({ collectionId }).exec()
      const choiceOrder = request.body as ChoiceOrder[]
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
      return reply.code(200).send(saved)
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })
}
