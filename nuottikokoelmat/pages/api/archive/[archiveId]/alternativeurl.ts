import { Archive, ArchiveModel, UrlAlternative } from '@/models/archive'

import { AlternativeUrlResponse } from '@/models/alternative'
import { dbConnect } from '@/models/dbConnect'
import type { NextApiRequest, NextApiResponse } from 'next'
import { isArchiveVisitor } from '../../auth'
import { hasApi, secureFetch } from '../../config'

// returns alternative and url and headers to use it for fetching song files
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (!(await isArchiveVisitor(req, res))) {
    return
  }
  try {
    // if (hasApi('/api/archive/:archiveId/alternativeurl')) {
    // 	await apiHandler(req, res)
    // } else {
    // 	await mongoHandler(req, res)
    // }
    await mongoHandler(req, res)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

type EnvAlternative = { alternative: string; url: string; files: string }

function getEnvAlternatives(): EnvAlternative[] {
  // urls will be a JSON string like this: [{ "alternative": "somename", "url": "https://example.com/files" }]
  const urls = process.env.ALTERNATIVE_URLS

  console.debug('ALTERNATIVE_URLS', urls)

  if (!urls) {
    console.warn('no ALTERNATIVE_URLS specified')
    return []
  }

  try {
    const parsedUrls = JSON.parse(urls)

    if (!Array.isArray(parsedUrls)) {
      console.warn('ALTERNATIVE_URLS is not an array')
      return []
    }
    return parsedUrls
  } catch (error) {
    console.error('Failed to parse ALTERNATIVE_URLS, details:', error)
    return []
  }
}

function chooseBestAlternative(
  envAlternatives: EnvAlternative[],
  archiveAlternatives: UrlAlternative[]
): EnvAlternative | undefined {
  if (!envAlternatives || !archiveAlternatives) {
    return undefined
  }

  // sort archive alternatives by priority
  archiveAlternatives.sort((a, b) => b.priority - a.priority)

  // return the first env alternative that matches the auth of the archive alternative or undefined
  for (const archiveAlternative of archiveAlternatives) {
    const envAlternative = envAlternatives.find((envAlt) => envAlt.alternative === archiveAlternative.alternative)
    if (envAlternative) {
      return envAlternative
    }
  }
}

const fetchHeaders = async ({ alternative, url }: EnvAlternative) => {
  if (alternative === 'basictoken') {
    // make get request to the url, and extract token from json response
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    if (!res.ok) {
      throw new Error(`Failed to fetch token, status: ${res.status}`)
    }
    const data = await res.json()
    const token = data.token
    if (!token) {
      throw new Error('No token found in response')
    }
    // here the header is Basic <base64(token:<token>)>
    return { Authorization: `Basic ${Buffer.from(`token:${token}`).toString('base64')}` }
  }
  throw new Error(`Alternative ${alternative} not supported`)
}

const mongoHandler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const archiveId = req.query.archiveId || ''
  const id = typeof archiveId === 'string' ? archiveId : archiveId[0]
  await dbConnect()
  if (req.method === 'GET') {
    // use env and archive alternatives and choose the best one
    const envAlternatives = getEnvAlternatives()
    if (!envAlternatives) {
      res.status(200).json({})
      return
    }

    const archives: Array<Archive> = await ArchiveModel.find({ _id: id }).exec()
    if (archives.length !== 1) {
      res.status(404).json({})
      return
    }
    const alternatives = JSON.parse(JSON.stringify(archives[0])).urlAlternatives as UrlAlternative[]
    const alternative = chooseBestAlternative(envAlternatives, alternatives)

    if (!alternative) {
      console.log('No matching alternative URL found, archive had:', alternatives?.map((a) => a.alternative).join(', '))
      res.status(200).json({})
      return
    }
    const url = alternative.files
    const headers = await fetchHeaders(alternative)
    const response: AlternativeUrlResponse = { ...alternative, url, headers }
    res.status(200).json(response)
  }
}

export default handler
