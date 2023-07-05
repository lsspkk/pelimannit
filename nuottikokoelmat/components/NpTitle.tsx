import React from 'react'

export const NpTitle = ({ children }: { children: React.ReactNode }) => {
  return <div className='text-2xl font-bold'>{children}</div>
}

export const NpSubTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <div className={`text-lg font-bold ${className}`}>{children}</div>
}
