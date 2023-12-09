import { Archive, ArchiveModel } from '../../../../models/archive'

import { sessionOptions } from '../../../../models/session'
import { withIronSessionApiRoute } from 'iron-session/next'
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../../models/dbConnect'
import { hasApi, secureFetch } from '../../config'

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { archiveId } = req.query
  if (!archiveId) {
    res.status(400).json({ error: 'archiveId missing' })
    return
  }
  const id = typeof archiveId === 'string' ? archiveId : archiveId[0]

  if (req.session?.archiveVisitor?.archiveId !== id) {
    res.status(401).json({ error: 'not logged in' })
    console.log({ session: req.session })
    return
  }

  console.debug('1')
  try {
    if (hasApi('/api/archive/:archiveId')) {
      await apiHandler(req, res)
    } else {
      await mongoHandler(req, res)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

const apiHandler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method === 'PUT') {
    const response = await secureFetch(`/api/v1/archive/${req.query.archiveId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })
    const json = await response.json()
    console.log(`PUT /api/v1/archive/${req.query.archiveId}`, { json })
    res.status(response.status).json(json)
  } else if (req.method === 'GET') {
    console.debug('2')
    const response = await secureFetch(`/api/v1/archive/${req.query.archiveId}`)
    console.debug(`secureFetch to /api/v1/archive/${req.query.archiveId}}`)
    console.debug(response.status)
    const json = await response.json()
    console.log(`GET /api/v1/archive/${req.query.archiveId}`, { json })
    res.status(response.status).json(json)
  } else {
    res.status(500).json({ error: 'method not supported' })
  }
}

const mongoHandler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const archiveId = req.query.archiveId || ''
  const id = typeof archiveId === 'string' ? archiveId : archiveId[0]
  await dbConnect()
  if (req.method === 'PUT') {
    const archive: Archive | null = await ArchiveModel.findById(id).exec()

    if (!archive) {
      res.status(401).json({ error: `nuottiarkistoa ${id} ei löydy` })
    } else {
      console.log('updating archive', archive)
      ArchiveModel.findByIdAndUpdate(id, req.body, { new: true }).exec()
      res.status(200).json(archive)
    }
  }
  if (req.method === 'GET') {
    const archives: Array<Archive> = await ArchiveModel.find({ _id: archiveId }).exec()
    if (archives.length !== 1) {
      res.status(404).json({})
      return
    }
    const archive = JSON.parse(JSON.stringify(archives[0]))
    res.status(200).json(archive)
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)
