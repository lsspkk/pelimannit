import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { Archive, ArchiveModel } from '../models/archive'
import { SongModel, Song } from '../models/song'
import { securityPreHandler } from '../securityPreHandler'

interface ArchiveId {
  Params: {
    archiveId: string
  }
}

export const archiveRoutes: FastifyPluginAsync<{ prefix: string }> = async (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', securityPreHandler)

  fastify.get(`/api/v1/archive`, {}, async (request, reply) => {
    try {
      const archives = await ArchiveModel.find({}).exec()
      return reply.code(200).send(archives)
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })

  fastify.post<ArchiveId>('/api/v1/archive/search', {}, async (request, reply) => {
    try {
      const search: Archive = request.body as Archive
      const found = await ArchiveModel.find({ archivename: search.archivename }).exec()
      return reply.code(200).send(found)
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })

  fastify.post<{ Body: Archive }>('/api/v1/archive', {}, async (request, reply) => {
    try {
      const { createPassword, ...archive } = request.body as Archive & { createPassword: string }

      if (createPassword !== process.env.CREATE_PASSWORD || !createPassword) {
        return reply.code(401).send({ error: 'wrong password' })
      }

      const found = await ArchiveModel.find({ archivename: archive.archivename }).exec()
      if (found.length > 0) {
        return reply.code(400).send({ error: 'archivename already exists' })
      }
      const newArchive = new ArchiveModel(archive)
      const saved = await newArchive.save()
      reply.code(201).send(saved)
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })

  fastify.get<ArchiveId>('/api/v1/archive/:archiveId', {}, async (request, reply) => {
    try {
      const { archiveId } = request.params
      const archives: Array<Archive> = await ArchiveModel.find({ _id: archiveId }).exec()
      if (archives.length !== 1) {
        return reply.code(404).send({ error: `archive ${archiveId} not found` })
      }
      const archive = JSON.parse(JSON.stringify(archives[0]))
      return reply.code(200).send(archive)
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })

  fastify.put<ArchiveId>('/api/v1/archive/:id', {}, async (request, reply) => {
    try {
      const archiveId = request.params.archiveId
      const archive: Archive | null = await ArchiveModel.findById(archiveId).exec()

      if (!archive) {
        return reply.code(404).send({ error: `archive ${archiveId} not found` })
      } else {
        console.log('updating archive', archive)
        const updatedArchive = { ...archive, ...(request.body as Archive) }
        ArchiveModel.findByIdAndUpdate(archiveId, updatedArchive, { new: true }).exec()
        return reply.code(200).send(archive)
      }
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })

  fastify.get<ArchiveId>('/api/v1/archive/:archiveId/songs', {}, async (request, reply) => {
    try {
      const { archiveId } = request.params
      const songs = (await SongModel.find({ archiveId }).exec()).sort((a: Song, b: Song) => {
        return a.path.localeCompare(b.path) * -1 || a.songname.localeCompare(b.songname)
      })
      return reply.code(200).send(songs)
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })

  fastify.post<ArchiveId>('/api/v1/archive/:archiveId/visitor/login', {}, async (request, reply) => {
    try {
      const { archiveId } = request.params
      const { visitorPassword } = request.body as { visitorPassword: string }
      const archive = await ArchiveModel.findById(archiveId).exec()
      if (!archive) {
        return reply.code(404).send({ error: `archive ${archiveId} not found` })
      }
      if (archive.visitorPassword !== visitorPassword) {
        return reply.code(401).send({ error: 'wrong password' })
      }
      return reply.code(200).send({ success: true })
    } catch (error) {
      request.log.error(error)
      return reply.send(500)
    }
  })
}
