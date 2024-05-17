import React from 'react'

export const CloseButtonIcon = ({ onClick }: { onClick: () => void }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-6 w-6 hover:text-gray-700 text-gray-400 cursor-pointer'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
		onClick={onClick}
	>
		<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
	</svg>
)
