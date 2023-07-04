'use client'
import React from 'react'
import { NpButton } from '@/components/NpButton'

export const NpBackButton = ({ onClick }: { onClick: () => void }) => (
  <NpButton className='fixed top-0 right-0 border border-gray-500 shadow-md' onClick={onClick}>
    Takaisin
  </NpButton>
)
