'use client'
import React from 'react'
import { NpButton } from '@/components/NpButton'

export const NpBackButton = ({ onClick, text }: { onClick: () => void; text?: string }) => (
  <NpButton
    className='fixed top-0 right-0 border border-gray-300 shadow-md px-[7px] py-[2px] m-2 rounded-full z-50'
    onClick={onClick}
  >
    {text || '<-'}
  </NpButton>
)
