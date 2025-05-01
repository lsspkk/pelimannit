import React from 'react'

interface PdfPageButtonProps {
	onClick: () => void
	disabled: boolean
	label: string
	position: 'left' | 'right'
}

const PdfPageButton: React.FC<PdfPageButtonProps> = ({ onClick, disabled, label, position }) => {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`bg-gray-200 p-2 rounded-md hover:bg-gray-300 fixed bottom-20 ${position}-0 text-xs w-16 text-center opacity-65`}
		>
			{label}
		</button>
	)
}

export default PdfPageButton
