import { Types } from 'mongoose'
import { Choice } from './choice'

export const removeChoice = async (id: Types.ObjectId): Promise<void> => {
  const response = await fetch(`/api/choice/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(response.statusText)
  }
}

export const addChoice = async (collectionId: Types.ObjectId, songId: Types.ObjectId): Promise<Choice> => {
  const response = await fetch(`/api/choice/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ collectionId, songId, created: new Date() }),
  })
  console.debug({ response })
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const choice = await response.json()
  return choice
}
