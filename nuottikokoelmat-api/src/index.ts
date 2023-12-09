import 'dotenv/config'
import Fastify from 'fastify'
import { archiveRoutes } from './api/archiveRoutes'
import { databasePlugin } from './databasePlugin'
import { collectionRoutes } from './api/collectionRoutes'
import { collectionChoiceRoutes } from './api/collectionChoiceRoutes'

const fastify = Fastify({
  logger: true,
})

fastify.get('/health', async () => ({ server: 'up' }))
fastify.register(databasePlugin)
fastify.register(archiveRoutes)
fastify.register(collectionRoutes)
fastify.register(collectionChoiceRoutes)

const PORT = process.env.FASTIFY_PORT ? process.env.FASTIFY_PORT : 5000

const optionsObject = {
  port: PORT as unknown as number,
  host: '0.0.0.0', // listen on all interfaces so that responds in docker
}
const start = async () => {
  try {
    await fastify.listen(optionsObject)
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}
start()
