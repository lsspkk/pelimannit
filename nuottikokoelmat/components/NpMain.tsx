'use client'
import { NpTitle } from "./NpTitle"
export const NpMain = ({ title, navigation, children }: { 
  title?: string
  navigation?: React.ReactNode
  children: React.ReactNode }) => {
  return (
    <main className='flex min-h-screen flex-col items-center justify-start  w-full max-w-lg mx-auto'>
      {(navigation || title) && <Navigation title={title}>{navigation}</Navigation>}
      <NpContent>
      {children}
      </NpContent>
    </main>
  )
}

const Navigation = ({ title, children }: { title?: string
  children: React.ReactNode
}) => {
  return (
    <div className='flex justify-between w-full items-center bg-gray-100 p-1 h-10'>
      {title && <div className="text-gray-600 ml-2">{title}</div> }
      </div>
  )
}

const NpContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col gap-4 w-full items-start pt-8 md:pt-20 px-2 md:px-8 '>
      {children}
    </div>
  )
}
