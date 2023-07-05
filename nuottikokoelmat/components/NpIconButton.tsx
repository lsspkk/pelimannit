'use client'
import React, { HTMLAttributes } from 'react'

export const NpIconButton = ({
  children,
  ...props
}: { children: React.ReactNode } & HTMLAttributes<HTMLButtonElement>) => {
  return (
    <button className='rounded-full bg-gray-200 p-2 self-center' {...props}>
      {children}
    </button>
  )
}
