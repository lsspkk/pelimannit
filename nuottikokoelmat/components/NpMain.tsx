'use client'

export const NpMain = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className='flex min-h-screen flex-col items-center justify-start pt-14 w-full px-2 md:pt-24 max-w-lg mx-auto'>
      {children}
    </main>
  )
}
