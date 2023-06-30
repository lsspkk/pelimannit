import React, { CSSProperties, SVGProps } from 'react'

export const NpButton = ({
  children,
  onClick,
  className,
  disabled = false,
  inProgress = false,
}: {
  children: React.ReactNode
  onClick: () => void
  className?: string
  disabled?: boolean
  inProgress?: boolean
}) => {
  return (
    <button
      onClick={onClick}
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${className}`}
      disabled={disabled}
    >
      {inProgress && (
        <div className='loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-6 w-6'>
          <SpinnerInfinity size={50} thickness={100} speed={100} color='#36ad47' secondaryColor='rgba(0, 0, 0, 0.44)' />
        </div>
      )}
      {!inProgress && children}
    </button>
  )
}

const SpinnerInfinity = ({
  secondaryColor,
  speed,
  still = false,
  thickness,
  ...svgProps
}: {
  secondaryColor: string
  speed: number
  still?: boolean
  thickness: number
  size?: number
} & SVGProps<SVGSVGElement>) => {
  const strokeWidth = 7 * (thickness / 100)
  const dashStyle: CSSProperties = !still
    ? { animation: `spinners-react-infinity ${140 / speed}s linear infinite` }
    : {}

  return (
    <svg fill='none' viewBox='0 0 131 55' {...svgProps}>
      <defs>
        <path
          d='M46.57 45.5138C36.346 55.4954 19.8919 55.4954 9.66794 45.5138C-0.55598 35.5321 -0.55598 19.4678 9.66794 9.48624C19.8919 -0.495412 36.346 -0.495412 46.57 9.48624L84.4303 45.5138C94.6543 55.4954 111.108 55.4954 121.332 45.5138C131.556 35.5321 131.556 19.4678 121.332 9.48624C111.108 -0.495412 94.6543 -0.495412 84.4303 9.48624L46.57 45.5138Z'
          id='spinners-react-infinity-path'
        />
      </defs>
      <use stroke={secondaryColor} strokeWidth={strokeWidth} xlinkHref='#spinners-react-infinity-path' />
      <use
        fill='none'
        stroke='currentColor'
        strokeDasharray='1, 347'
        strokeDashoffset='75'
        strokeLinecap='round'
        strokeWidth={strokeWidth}
        style={dashStyle}
        xlinkHref='#spinners-react-infinity-path'
      />
    </svg>
  )
}
