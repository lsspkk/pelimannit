import 'dotenv/config'
import Fastify from 'fastify'
import { archiveRoutes } from 'api/archiveRoutes'
import { databasePlugin } from 'databasePlugin'
import { collectionRoutes } from 'api/collectionRoutes'
import { collectionChoiceRoutes } from 'api/collectionChoiceRoutes'
import { securityPreHandler } from 'securityPreHandler'

const fastify = Fastify({
  logger: true,
})

fastify.register(databasePlugin)
fastify.addHook('preHandler', securityPreHandler)
fastify.register(archiveRoutes)
fastify.register(collectionRoutes)
fastify.register(collectionChoiceRoutes)

fastify.get('/health', async () => ({ server: 'up' }))
const PORT = process.env.FASTIFY_PORT ? process.env.FASTIFY_PORT : 5000

const optionsObject = {
  port: PORT as unknown as number,
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
