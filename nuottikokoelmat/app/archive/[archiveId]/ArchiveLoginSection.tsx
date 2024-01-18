'use client'
import { NpButton } from '@/components/NpButton'
import { NpDialog } from '@/components/NpDialog'
import { NpInput } from '@/components/NpInput'
import { Archive } from '@/models/archive'
import { ArchiveRole } from '@/models/archiveUser'
import { useArchiveUser } from '@/models/swrApi'
import React from 'react'
import { ManagingSection } from './page'

export const ArchiveLoginSection = (
	{ archiveId, setSection, archive }: { archiveId: string; archive: Archive; setSection: (section: ManagingSection) => void },
) => {
	const [username, setUsername] = React.useState(`Ylläpito: ${archive?.archivename || ''}`)
	const [password, setPassword] = React.useState('')
	const [managerChecked, setManagerChecked] = React.useState(false)
	const [error, setError] = React.useState('')
	const { mutate } = useArchiveUser(archiveId)

	const onStart = async () => {
		const role = managerChecked ? ArchiveRole.MANAGER : ArchiveRole.USER

		const response = await fetch(`/api/archive/${archiveId}/manage/start`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password, role }),
		})
		if (response.ok) {
			setSection('NONE')
			mutate({ archiveId, username, role })
		} else {
			setError('Virheellinen käyttäjätunnus tai salasana')
		}
	}
	return (
		<NpDialog onClose={() => setSection('NONE')}>
			<div className='flex flex-col gap-4 md:max-w-md'>
				<div>Kirjaudu ylläpitämään arkistoa</div>
				<NpInput autoFocus placeholder='Käyttäjätunnus' value={username} onChange={(e) => setUsername(e.target.value)} />
				<NpInput type='password' placeholder='Salasana' value={password} onChange={(e) => setPassword(e.target.value)} />

				<div className='flex flex-row gap-4 items-center'>
					<input id='manager' type='checkbox' checked={managerChecked} onChange={(e) => setManagerChecked(e.target.checked)} />
					<label htmlFor='manager'>Manageri</label>
				</div>

				<div className='text-red-800 h-8'>{error}</div>
				<div className='flex flex-row gap-4 justify-between'>
					<NpButton variant='secondary' onClick={() => setSection('NONE')}>Peruuta</NpButton>
					<NpButton onClick={onStart}>Kirjaudu</NpButton>
				</div>
			</div>
		</NpDialog>
	)
}
