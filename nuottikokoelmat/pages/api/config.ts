

const API_SET = new Set<string>(['GET archive'], ['POST archive'])

export const hasApi = (method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string): boolean => {
  return API_SET.has(`${method} ${path}`)
}
