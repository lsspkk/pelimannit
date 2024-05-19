'use client'
import { CloseButtonIcon } from '@/components/icons/CloseButtonIcon'
import { NpDialog } from '@/components/NpDialog'
import { NpInput } from '@/components/NpInput'
import { SortSettings } from '@/models/sortSettings'
import React from 'react'

export const SortSettingsDialog = (
	{ onClose, sortSettings, setSortSettings }: {
		onClose: () => void
		sortSettings: SortSettings
		setSortSettings: (sortSettings: SortSettings) => void
	},
) => {
	const { year, songname } = sortSettings
	const yearDesc = year === 'DESC' && songname === 'ASC'
	const songnameAsc = songname === 'ASC' && year === 'NONE'
	const songnameDesc = songname === 'DESC' && year === 'NONE'

	const onSortRadio = (year: 'ASC' | 'DESC' | 'NONE', songname: 'ASC' | 'DESC' | 'NONE') => {
		setSortSettings({ ...sortSettings, year, songname })
	}

	return (
		<NpDialog onClose={onClose}>
			<div className='flex w-full justify-end'>
				<div className='-mt-2 mb-2 -mr-2'>
					<CloseButtonIcon onClick={onClose} />
				</div>
			</div>
			<div className='flex gap-4 content-evenly'>
				<div className='flex flex-col gap-2 w-1/2'>
					<label htmlFor='filter' className='text-gray-500'>Rajaus</label>
					<NpInput id='filter' value={sortSettings.filter} onChange={(e) => setSortSettings({ ...sortSettings, filter: e.target.value })} />
				</div>

				<div className='flex flex-col gap-2 w-1/2 ml-6'>
					<div className='text-gray-500'>Järjestys</div>
					<div className='flex gap-2'>
						<input
							id='yearAsc'
							type='radio'
							name='sortType'
							value='yearDesc'
							checked={yearDesc}
							onChange={() => onSortRadio('DESC', 'ASC')}
						/>
						<label htmlFor='yearAsc' onClick={() => onSortRadio('DESC', 'ASC')}>Vuosi</label>
					</div>

					<div className='flex gap-2 '>
						<input type='radio' name='sortType' value='songnameAsc' checked={songnameAsc} onChange={() => onSortRadio('NONE', 'ASC')} />
						<label htmlFor='songnameAsc' onClick={() => onSortRadio('NONE', 'ASC')}>Nimi A-Ö</label>
					</div>

					<div className='flex gap-2'>
						<input type='radio' name='sortType' value='songnameDesc' checked={songnameDesc} onChange={() => onSortRadio('NONE', 'DESC')} />
						<label htmlFor='songnameDesc' onClick={() => onSortRadio('NONE', 'DESC')}>Nimi Ö-A</label>
					</div>
				</div>
			</div>
		</NpDialog>
	)
}
