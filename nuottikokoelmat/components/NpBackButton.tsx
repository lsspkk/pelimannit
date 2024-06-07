'use client'
import { NpButton } from '@/components/NpButton'
import React from 'react'

export const NpBackButton = (
	{ onClick, text, className = '', songPage = false }: {
		onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
		text?: string
		className?: string
		songPage?: boolean
	},
) => {
	const top = songPage ? 'top-12 right-2' : 'top-0 right-0'

	return (
		<NpButton
			className={`fixed ${top} border border-gray-300 shadow-md -p-2 rounded-full ${className}`}
			onClick={onClick}
		>
			{text ?? <ArrowFatLeft className='w-6 h-6' />}
		</NpButton>
	)
}

// arrow fat left
const ArrowFatLeft = ({ className = '' }: { className?: string }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 256 256'
		className={`h-6 w-6 -mx-[10px] -my-[2px] text-gray-100 ${className}`}
		fill='none'
		stroke='currentColor'
		strokeLinecap='round'
		strokeLinejoin='round'
		strokeWidth='12'
	>
		<path d='M120,32,24,128l96,96V176h88a8,8,0,0,0,8-8V88a8,8,0,0,0-8-8H120Z' fill='none' stroke='currentColor' />
	</svg>
)
