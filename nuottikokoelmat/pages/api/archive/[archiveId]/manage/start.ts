import { ArchiveRole } from '@/models/archiveUser'
import { sessionOptions } from '@/models/session'
import { isArchiveVisitor } from '@/pages/api/auth'
import bcrypt from 'bcrypt'
import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'

async function startManageRoute(req: NextApiRequest, res: NextApiResponse) {
  if (!isArchiveVisitor(req, res)) {
    return
  }
  const archiveId = req.query.archiveId as string
  const { username, password, role } = await req.body
  //console.debug('startManageRoute', { username, password })

  if (role !== ArchiveRole.MANAGER && role !== ArchiveRole.USER) {
    res.status(400).json({ message: 'Invalid role' })
    return
  }

  try {
    const passwordHash = getPasswordHash(archiveId, role)
    if (!passwordHash) {
      res.status(401).json({ message: 'Unauthorized, you have no password' })
      return
    }

    const passwordMatch = bcrypt.compareSync(password, passwordHash)
    if (passwordMatch) {
      const archiveUser = { username, archiveId, role }
      req.session.archiveUser = archiveUser
      await req.session.save()
      res.json(archiveUser)
      return
    }

    res.status(401).json({ message: 'Unauthorized, wrong password' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: (error as Error).message })
  }
}

const getPasswordHash = (archiveId: string, role: string): string | null => {
  const envPasswords =
    role === ArchiveRole.MANAGER ? process.env.ARCHIVE_MANAGER_PASSWORDS : process.env.ARCHIVE_USER_PASSWORDS

  apiConsole({ envPasswords })
  const passwords = envPasswords?.split('---')

  apiConsole('startManageRoute', { passwords })
  if (!passwords) {
    return null
  }
  const archivePasswords = passwords.filter((p) => p.split(':')[0] === archiveId)
  if (archivePasswords.length === 0) {
    return null
  }
  return archivePasswords[0].split(':')[1]
}

const apiConsole = (message?: any, ...optionalParams: any[]) => {
  if (process.env.LOGLEVEL_DEBUG) {
    console.debug(message, optionalParams)
  }
}

export default withIronSessionApiRoute(startManageRoute, sessionOptions)
