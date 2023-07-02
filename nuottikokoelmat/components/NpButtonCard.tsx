'use client'

export const NpButtonCard = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
  const hover = onClick ? 'hover:bg-cyan-600 hover:text-white cursor-pointer' : ''
  return (
    <div onClick={onClick} className={`rounded-sm shadow-md p-2 flex border border-cyan-600 w-full ${hover}`}>
      {children}
    </div>
  )
}
