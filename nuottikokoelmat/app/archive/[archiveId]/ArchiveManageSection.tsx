'use client'
import { NpButton } from '@/components/NpButton'
import { NpInput } from '@/components/NpInput'
import { NpSubTitle } from '@/components/NpTitle'
import { ArchiveRole, hasRole } from '@/models/archiveUser'
import { useArchive, useArchiveUser } from '@/models/swrApi'
import { useRouter } from 'next/navigation'
import React from 'react'
import { ManagingSection } from './page'

export const ArchiveManageSection = (
	{ archiveId, setSection, onStop }: { archiveId: string; setSection: (section: ManagingSection) => void; onStop: () => void },
) => {
	const { data: archive, mutate: mutateArchive } = useArchive(archiveId)
	const { data: archiveUser } = useArchiveUser(archiveId)
	const router = useRouter()

	const [password, setPassword] = React.useState(archive?.visitorPassword || '')
	const [error, setError] = React.useState('')

	const onUpdatePassword = async () => {
		const response = await fetch(`/api/archive/${archiveId}/manage/visitorPassword`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ visitorPassword: password }),
		})
		if (response.ok && archive) {
			mutateArchive({ ...archive, visitorPassword: password })
		} else {
			setError('Virheellinen salasana')
		}
	}
	const saveDisabled = password === archive?.visitorPassword || password.length < 4

	return (
		<div className='flex flex-col gap-4 w-full pt-12 md:pt-24'>
			<NpSubTitle>Arkiston ylläpito</NpSubTitle>
			<div className='flex flex-row gap-4 justify-end w-full'>
				{hasRole(archiveUser, ArchiveRole.MANAGER) && (
					<NpButton onClick={() => router.push(`/archive/${archiveId}/songs/manage`)}>Kappaleiden hallinta</NpButton>
				)}
				<NpButton className='w-28 self-end' onClick={onStop}>Lopeta ylläpito</NpButton>
			</div>
			{archive && (
				<div className='flex flex-col gap-4 w-full pt-4 md:pt-14'>
					<NpSubTitle>Vierailijoiden salasana</NpSubTitle>
					<div className='self-end'>
						<div className='flex flex-row gap-4 text-sm mb-2 opacity-60'>
							<div className='w-12'>Vanha:</div>
							<div>{archive.visitorPassword}</div>
						</div>
						<div className='flex flex-row gap-4 '>
							<div className='w-12'>Uusi:</div>
							<NpInput placeholder='Salasana' value={password} onChange={(e) => setPassword(e.target.value)} />
						</div>
					</div>
					{error && <div className='text-red-800'>{error}</div>}
					<div className='flex flex-row gap-4 justify-end'>
						<NpButton disabled={saveDisabled} onClick={onUpdatePassword}>Tallenna salasana</NpButton>
					</div>
				</div>
			)}
		</div>
	)
}
