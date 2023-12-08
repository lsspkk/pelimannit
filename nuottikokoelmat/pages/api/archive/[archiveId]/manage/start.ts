import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { sessionOptions } from '@/models/session'
import bcrypt from 'bcrypt'

async function startManageRoute(req: NextApiRequest, res: NextApiResponse) {
  const archiveId = req.query.archiveId as string
  if (!archiveId) {
    res.status(400).json({ error: 'archiveId missing' })
    return
  }
  if (req.session?.archiveVisitor?.archiveId !== archiveId) {
    res.status(401).json({ error: 'not logged in' })
    return
  }

  const { username, password } = await req.body
  console.debug('startManageRoute', { username, password })
  try {
    const passwods = process.env.ARCHIVE_PASSWORDS?.split('---') || []
    const archivePasswords = passwods.filter((p) => p.split(':')[0] === archiveId)

    console.debug('startManageRoute', { archivePasswords, passwods })
    if (!archivePasswords) {
      res.status(401).json({ message: 'Unauthorized, you have no password' })
      return
    }

    for (const archivePassword of archivePasswords) {
      const archivePasswordHash = archivePassword.split(':')[1]
      const passwordMatch = bcrypt.compareSync(password, archivePasswordHash)
      if (passwordMatch) {
        const archiveUser = { username, archiveId }
        req.session.archiveUser = archiveUser
        await req.session.save()
        res.json(archiveUser)
        return
      }
    }
    res.status(401).json({ message: 'Unauthorized, wrong password' })
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}

export default withIronSessionApiRoute(startManageRoute, sessionOptions)
