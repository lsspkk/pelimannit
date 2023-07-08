import React from 'react'

export const NpTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <div className={`text-2xl font-bold text-amber-700 text-shadow-sm shadow-black ${className}`}>{children}</div>
}

export const NpSubTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <div className={`text-lg font-bold text-amber-700 text-shadow-sm shadow-black ${className}`}>{children}</div>
}
