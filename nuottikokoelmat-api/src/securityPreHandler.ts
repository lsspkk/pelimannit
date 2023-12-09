import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'

const SECURE_API_TOKEN = process.env.SECURE_API_TOKEN ?? 'abc123'

console.debug('secure api token', SECURE_API_TOKEN)

export const securityPreHandler = (request: FastifyRequest, reply: FastifyReply, next: HookHandlerDoneFunction) => {
  console.debug('securityPlugin', request.originalUrl, request.hostname, request.ip, request.headers.authorization)
  if (request.headers.authorization) {
    const token = request.headers.authorization.split(' ')[1]
    if (token === SECURE_API_TOKEN) {
      return next()
    }
  }
  console.error('invalid token', request.originalUrl, request.hostname, request.ip)
  reply.code(403).send({ error: 'invalid token' })
}
