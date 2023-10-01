'use client'
import React from 'react'
import { NpButton } from '@/components/NpButton'

export const NpBackButton = ({ onClick, text, className }: { onClick: () => void; text?: string, className?: string } 
) => (
  <NpButton
    {...props}
    className={`fixed top-0 right-0 border border-gray-300 shadow-md px-[7px] py-[2px] m-[5px]  rounded-full z-0 ${className}`}
    onClick={onClick}
  >
    {text || '<-'}
  </NpButton>
)
