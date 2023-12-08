import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI ?? ''

export const databasePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  try {
    mongoose.connection.on('connected', () => {
      fastify.log.info({ actor: 'MongoDB' }, 'connected')
    })
    mongoose.connection.on('disconnected', () => {
      fastify.log.error({ actor: 'MongoDB' }, 'disconnected')
    })
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined')
    }
    await mongoose.connect(MONGODB_URI, {})
    fastify.decorate('db', {})
  } catch (error) {
    console.error(error)
  }
}
