'use client'

import { NpButton } from '@/components/NpButton'
import { NpInput } from '@/components/NpInput'
import { NpMain } from '@/components/NpMain'
import { NpTitle } from '@/components/NpTitle'
import { useArchive, useArchives } from '@/models/swrApi'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Input } from 'postcss'
import React from 'react'

export default function Home() {
	const router = useRouter()
	const [visitorPassword, setVisitorPassword] = React.useState('')
	const { data } = useArchives()
	const [error, setError] = React.useState('')
	const pathname = useSearchParams()?.get('pathname') || '//'
	const archiveId = decodeURIComponent(pathname).split('/')[2]

	const onLogin = async (e?: React.FormEvent) => {
		e?.preventDefault()
		const res = await fetch(`/api/archive/${archiveId}/visitor/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ visitorPassword }),
		})
		if (res.ok) {
			router.push(pathname)
		} else {
			setError('Väärä salasana')
		}
	}

	const archive = data?.find((a) => a._id === archiveId)

	return (
		<NpMain title='Kirjaudu'>
			<form className='flex flex-col gap-4 w-full'>
				{!archive && <NpTitle>Pääsy evätty</NpTitle>}
				{archive && (
					<React.Fragment>
						<NpTitle>{archive.archivename}</NpTitle>
						<div>Pääsy evätty</div>
					</React.Fragment>
				)}
				<div>Kirjaudu vierailijaksi nuottiarkistoon, jotta voit käyttää sitä.</div>

				<input type='text' value={archive?.archivename || ''} hidden readOnly name='username' />

				<NpInput
					autoFocus
					label='Vierailijan salasana'
					value={visitorPassword}
					type='password'
					onChange={(e) => setVisitorPassword(e.target.value)}
				/>

				<div className='text-red-500'>{error}</div>
				<div className='flex gap-4 justify-between'>
					<NpButton variant='secondary' onClick={() => router.push('/')}>Etusivulle</NpButton>
					<NpButton type='submit' onClick={onLogin}>Kirjaudu</NpButton>
				</div>
			</form>
		</NpMain>
	)
}
