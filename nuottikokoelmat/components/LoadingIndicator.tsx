'use client'
import { Spinner } from '@/components/Spinner'
import React from 'react'

export const LoadingIndicator = ({ variant = 'primary' }: { variant?: 'primary' | 'secondary' }) => {
	const spinnerClassName = variant === 'secondary' ? 'opacity-20' : ''

	return (
		<div className='flex flex-col gap-4 w-full items-center mt-8 md:mt-14'>
			<Spinner size='large' variant='dark' className={spinnerClassName} />

			{variant === 'primary' && <div className='opacity-20 text-xs'>Ladataan...</div>}
		</div>
	)
}
