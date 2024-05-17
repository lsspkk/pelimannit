import React from 'react'
import { Spinner } from './Spinner'

export const NpButton = (
	{ children, onClick, className = '', disabled = false, inProgress = false, variant = 'primary', type = 'button' }: {
		children: React.ReactNode
		onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
		className?: string
		disabled?: boolean
		inProgress?: boolean
		variant?: 'primary' | 'secondary'
		type?: 'button' | 'submit'
	},
) => {
	const primary = 'bg-sky-700 text-white hover:bg-sky-800 hover:text-white'
	const secondary = 'bg-white text-sky-600 border-sky-600 border hover:bg-sky-100 hover:text-sky-800'
	return (
		<button
			type={type}
			onClick={onClick}
			className={`${
				variant === 'primary' ? primary : secondary
			} bg-opacity-70 border text-gray-800 py-2 px-4 rounded shadow-inner shadow-sm transform active:scale-75 transition-transform ${
				disabled ? 'opacity-20 ' : ''
			}  ${className}`}
			disabled={disabled}
		>
			{inProgress && (
				<>
					<div className='opacity-0'>{children}</div>
					<div className='relative flex w-full justify-center loader ease-linear h-8 -mt-8 opacity-100 '>
						<Spinner />
					</div>
				</>
			)}
			{!inProgress && children}
		</button>
	)
}
