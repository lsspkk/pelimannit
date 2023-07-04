import React from 'react'

export const NpTitle = ({ children }: { children: React.ReactNode }) => {
  return <div className='text-2xl font-bold'>{children}</div>
}

export const NpSubTitle = ({ children }: { children: React.ReactNode }) => {
  return <div className='text-lg font-bold'>{children}</div>
}
