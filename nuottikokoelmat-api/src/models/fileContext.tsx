'use client'

import { Types } from 'mongoose'
import React, { createContext, useContext, useState } from 'react'

type FileMapType = Map<Types.ObjectId, File>

type FileMapContextType = [FileMapType, React.Dispatch<React.SetStateAction<FileMapType>>]

const FileMapContext = createContext<FileMapContextType | undefined>(undefined)

export const FileMapProvider = ({ children }: { children: React.ReactNode }) => {
  const [fileMap, setFileMap] = useState<FileMapType>(new Map())

  return <FileMapContext.Provider value={[fileMap, setFileMap]}>{children}</FileMapContext.Provider>
}

export const useFileMap = () => {
  const context = useContext(FileMapContext)
  if (context === undefined) {
    throw new Error('useFileMap must be used within a FileMapProvider')
  }
  return context
}

export const useFileMapValue = () => {
  const context = useContext(FileMapContext)
  if (context === undefined) {
    throw new Error('useFileMapValue must be used within a FileMapProvider')
  }
  return context[0]
}
