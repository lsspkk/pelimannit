import React from 'react'

export const NpTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`text-2xl font-extrabold text-emerald-700 text-shadow-sm shadow-sky-200 ${className}`}>
      {children}
    </div>
  )
}

export const NpSubTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`text-xl font-bold text-emerald-800 text-shadow-sm shadow-emerald-100 ${className}`}>
      {children}
    </div>
  )
}
