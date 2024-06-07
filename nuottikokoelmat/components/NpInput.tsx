import React from 'react'

export const NpInput = (
	{ label, value, onChange, className, ...props }: {
		label?: string
		value: string
		onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
		className?: string
	} & React.InputHTMLAttributes<HTMLInputElement>,
) => {
	return (
		<div className={`flex flex-col gap-2 ${className}`}>
			{label && <label>{label}</label>}
			<input
				{...props}
				className='p-[4px] rounded-sm border-gray-300 focus:border-2 focus:border-sky-700 focus:outline-none focus:shadow-sm border'
				value={value}
				onChange={onChange}
			/>
		</div>
	)
}
