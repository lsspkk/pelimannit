// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import type { SessionOptions } from 'iron-session'
import { ArchiveUser } from './archiveUser'
import { ArchiveVisitor } from './archiveVisitor'
import { User } from './user'

export const sessionOptions: SessionOptions = {
	password: process.env.SECRET_COOKIE_PASSWORD as string,
	cookieName: 'iron-session/examples/next.js',
	// secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
	cookieOptions: { secure: process.env.NODE_ENV === 'production' },
}

declare module 'iron-session' {
	interface IronSessionData {
		user?: User
		archiveUser?: ArchiveUser
		archiveVisitor?: ArchiveVisitor
	}
}
