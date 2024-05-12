import React, { CSSProperties, SVGProps } from 'react'

export const Spinner = (
	{ variant = 'light', size = 'normal', speed = 100, className, ...svgProps }: {
		variant?: 'light' | 'dark'
		size?: 'normal' | 'large'
		speed?: number
		className?: string
	} & SVGProps<SVGSVGElement>,
) => {
	const animation: CSSProperties = {
		animation: `round-spinner-1 ${100 / speed}s linear infinite alternate, round-spinner-2 ${200 / speed}s infinite linear`,
	}

	const background = variant === 'light' ? 'border-gray-100' : 'border-black'
	const dimensions = size === 'normal' ? 'h-7 w-7 mt-[5px] border-[3.5px]' : 'border-4 h-12 w-12'

	return (
		<div
			className={`rounded-full opacity-50 ${dimensions} ${background} ${className ? `${className} ` : ''}round_spinner`}
			style={animation}
		/>
	)
}
