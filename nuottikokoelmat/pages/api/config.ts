const SECURE_API_SET = new Set<string>([
  '/api/archive',
  '/api/archive/:archiveId',
  '/api/archive/:archiveId/collection',
  '/api/archive/:archiveId/songs',
  '/api/archive/:archiveId/visitor/login',
  '/api/collection/:collectionId',
  '/api/collection/:collectionId/songs',
  '/api/collection/:collectionId/choices',
  '/api/collection/:collectionId/choice/array',
  '/api/collection/:collectionId/choice/order',
])

export const hasApi = (path: string): boolean => {
  return SECURE_API_SET.has(path)
}
export const secureFetch = async (path: string, init?: RequestInit): Promise<Response> => {
  const headers: Record<string, string> = { Authorization: `Bearer ${process.env.SECURE_API_TOKEN}` }
  if (init?.method === 'POST' || init?.method === 'PUT') {
    headers['Content-Type'] = 'application/json'
  }
  init = init ?? {}
  init.headers = headers

  const response = await fetch(`${process.env.API_URL}${path}`, init)
  return response
}
