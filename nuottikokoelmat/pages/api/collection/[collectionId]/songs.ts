import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/models/dbConnect'
import { Song, SongModel } from '@/models/song'
import { ChoiceModel } from '@/models/choice'
import { hasApi, secureFetch } from '../../config'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const collectionId = req.query.collectionId as string
  if (!collectionId) {
    res.status(400).json({ error: 'collectionId missing' })
    return
  }

  try {
    if (hasApi('/api/collection/:collectionId/songs')) {
      await apiHandler(req, res, collectionId)
    } else {
      await mongoHandler(req, res, collectionId)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
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

const apiHandler = async (req: NextApiRequest, res: NextApiResponse, collectionId: string): Promise<void> => {
  if (req.method === 'GET') {
    const response = await secureFetch(`/api/v1/collection/${collectionId}/songs`)
    const json = await response.json()
    res.status(response.status).json(json)
  } else {
    res.status(500).json({ error: 'method not supported' })
  }
}
const mongoHandler = async (req: NextApiRequest, res: NextApiResponse, collectionId: string): Promise<void> => {
  await dbConnect()
  if (req.method === 'GET') {
    console.debug('GET songs for collection', collectionId)
    const choices = await ChoiceModel.find({ collectionId }).exec()
    if (choices.length === 0) {
      res.status(200).json([])
      return
    }

    const indexMap = new Map<string, number | undefined>()
    choices.forEach((choice) => {
      indexMap.set(String(choice.songId), choice.index)
    })
    const songIds = choices.map((choice) => choice.songId)
    const songs = await SongModel.find({ _id: { $in: songIds } }).exec()

    const songsWithIndex = songs.map((song) => {
      const index = indexMap.get(String(song._id))
      return { ...song.toObject(), index }
    })
    const orderedSongs = songsWithIndex.sort(indexCompareFn).map((song) => {
      const { index, ...rest } = song
      return rest
    })
    res.status(200).json([...orderedSongs])
  } else {
    res.status(500).json({ error: 'method not supported' })
  }
}
