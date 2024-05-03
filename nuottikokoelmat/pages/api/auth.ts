import { ArchiveRole } from '@/models/archiveUser'
import { sessionOptions } from '@/models/session'
import { google } from 'googleapis'
import { getIronSession, IronSessionData } from 'iron-session'
import { NextApiRequest, NextApiResponse } from 'next'

export const SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
export const keyJson = Buffer.from(process.env.CREDENTIALS_BASE64 || '', 'base64').toString('ascii')

export async function driveAuth () {
	try {
		return new google.auth.GoogleAuth({ credentials: JSON.parse(keyJson), scopes: SCOPES })
	} catch (error) {
		console.log(error)
	}
	return null
}

export async function getSession (req: NextApiRequest, res: NextApiResponse) {
	return getIronSession<IronSessionData>(req, res, sessionOptions)
}

// the request path needs to have archiveId
// if role is manager, then thte session has manager role
// if role is user, then the session has user role or manager role
export async function hasArchiveAuth (req: NextApiRequest, res: NextApiResponse, role: ArchiveRole) {
	const archiveId = req.query.archiveId as string
	if (!archiveId) {
		res.status(400).json({ error: 'archiveId missing' })
		return false
	}
	if (process.env.CREATE_PASSWORDS) {
		return true
	}

	const session = await getSession(req, res)

	if (!session?.archiveUser || session?.archiveUser.archiveId !== archiveId) {
		res.status(401).json({ error: 'Unauthorized' })
		return false
	}
	if (role === ArchiveRole.MANAGER && session?.archiveUser.role !== ArchiveRole.MANAGER) {
		res.status(401).json({ error: 'Unauthorized' })
		return false
	}
	return true
}

// the request path does not need to have archiveId
// session has more than visitor role, either manager or user
export const isAuthorized = async (req: NextApiRequest, res: NextApiResponse): Promise<boolean> => {
	const session = await getSession(req, res)

	const archiveId = session?.archiveUser?.archiveId
	if (!archiveId) {
		res.status(401).json({ error: 'Unauthorized' })
		return false
	}
	return true
}

// the request path needs to have archiveId
// session has visitor role
export async function isArchiveVisitor (req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
	if (!req.query.archiveId) {
		res.status(400).json({ error: 'archiveId missing' })
		return false
	}
	const session = await getSession(req, res)

	const archiveId = req.query.archiveId as string
	if (session?.archiveVisitor?.archiveId !== archiveId) {
		res.status(401).json({ error: 'visitor not logged in' })
		return false
	}
	return true
}
