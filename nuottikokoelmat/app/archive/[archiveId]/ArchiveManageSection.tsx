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
	const { data: archive, isLoading, mutate: mutateArchive } = useArchive(archiveId)
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
		<div className='flex flex-col gap-4 w-full pt-2 md:pt-4'>
			<NpSubTitle>Ylläpito</NpSubTitle>

			<div className='flex flex-row gap4 justify-start w-full'>
				<NpButton className='w-28 self-end' onClick={onStop}>Lopeta ylläpito</NpButton>
				{hasRole(archiveUser, ArchiveRole.MANAGER) && (
					<div className='flex flex-col gap-2 w-full mb-12'>
						<div className='flex justify-start'>
							<NpButton onClick={() => router.push(`/archive/${archiveId}/songs/manage`)}>Kappaleiden hallinta</NpButton>
						</div>
					</div>
				)}
			</div>

			{isLoading && <div>Ladataan...</div>}
			{archive && (
				<div className='flex flex-col gap-4 w-full pt-2 md:pt-8 justify-end self-end'>
					<NpSubTitle>Vierailijoiden salasana</NpSubTitle>
					<div className='flex flex-row gap-4 justify-stretch'>
						<div className='w-20'>Vanha:</div>
						<NpInput className='opacity-50' onChange={() => {}} disabled value={archive.visitorPassword || ''} />
					</div>
					<div className='flex flex-row gap-4 justify-stretch'>
						<div className='w-20'>Uusi:</div>
						<NpInput placeholder='Salasana' value={password} onChange={(e) => setPassword(e.target.value)} />
					</div>

					{error && <div className='text-red-800'>{error}</div>}
					<div className='flex flex-row gap-4 justify-start'>
						<NpButton disabled={saveDisabled} onClick={onUpdatePassword}>Tallenna salasana</NpButton>
					</div>
				</div>
			)}
		</div>
	)
}
