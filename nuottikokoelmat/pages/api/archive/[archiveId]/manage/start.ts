import { ArchiveRole, hasRole } from "@/models/archiveUser"
import { sessionOptions } from "@/models/session"
import bcrypt from "bcrypt"
import { get } from "http"
import { withIronSessionApiRoute } from "iron-session/next"
import { NextApiRequest, NextApiResponse } from "next"

async function startManageRoute (req: NextApiRequest, res: NextApiResponse) {
	const archiveId = req.query.archiveId as string
	if (!archiveId) {
		res.status(400).json({ error: "archiveId missing" })
		return
	}
	if (req.session?.archiveVisitor?.archiveId !== archiveId) {
		res.status(401).json({ error: "not logged in" })
		return
	}

	const { username, password, role } = await req.body
	console.debug("startManageRoute", { username, password })

	try {
		const passwordHash = getPasswordHash(archiveId, role)
		if (!passwordHash) {
			res.status(401).json({ message: "Unauthorized, you have no password" })
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

		res.status(401).json({ message: "Unauthorized, wrong password" })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: (error as Error).message })
	}
}

const getPasswordHash = (archiveId: string, role: string): string => {
	const envPasswords = role === ArchiveRole.MANAGER ? process.env.ARCHIVE_MANAGER_PASSWORDS : process.env.ARCHIVE_USER_PASSWORDS

	console.log({ envPasswords })
	const passwords = envPasswords?.split("---")

	console.debug("startManageRoute", { passwords })

	const archivePasswords = passwords.filter((p) => p.split(":")[0] === archiveId)
	if (archivePasswords.length === 0) {
		return null
	}
	return archivePasswords[0].split(":")[1]
}

export default withIronSessionApiRoute(startManageRoute, sessionOptions)
