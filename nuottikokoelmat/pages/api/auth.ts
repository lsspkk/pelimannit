import { ArchiveRole } from '@/models/archiveUser'
import { google } from 'googleapis'
import { NextApiRequest, NextApiResponse } from 'next'

export const SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
export const keyJson = Buffer.from(process.env.CREDENTIALS_BASE64 || '', 'base64').toString('ascii')

export async function driveAuth() {
  try {
    return new google.auth.GoogleAuth({ credentials: JSON.parse(keyJson), scopes: SCOPES })
  } catch (error) {
    console.log(error)
  }
  return null
}

// the request path needs to have archiveId
// if role is manager, then thte session has manager role
// if role is user, then the session has user role or manager role
export function hasArchiveAuth(req: NextApiRequest, res: NextApiResponse, role: ArchiveRole) {
  const archiveId = req.query.archiveId as string
  if (!archiveId) {
    res.status(400).json({ error: 'archiveId missing' })
    return false
  }
  if (process.env.CREATE_PASSWORDS) {
    return true
  }
  if (!req.session?.archiveUser || req.session?.archiveUser.archiveId !== archiveId) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  if (role === ArchiveRole.MANAGER && req.session?.archiveUser.role !== ArchiveRole.MANAGER) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

// the request path does not need to have archiveId
// session has more than visitor role, either manager or user
export const isAuthorized = (req: NextApiRequest, res: NextApiResponse): boolean => {
  const archiveId = req.session?.archiveUser?.archiveId
  if (!archiveId) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

// the request path needs to have archiveId
// session has visitor role
export function isArchiveVisitor(req: NextApiRequest, res: NextApiResponse): boolean {
  if (!req.query.archiveId) {
    res.status(400).json({ error: 'archiveId missing' })
    return false
  }
  const archiveId = req.query.archiveId as string
  if (req.session?.archiveVisitor?.archiveId !== archiveId) {
    res.status(401).json({ error: 'visitor not logged in' })
    return false
  }
  return true
}
