import { SWRConfig } from 'swr'
import './globals.css'
import { Inter } from 'next/font/google'
import path from 'path'
import { SWRProvider } from './swr-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Nuottiarkistot',
  description: 'Nuottiarkistoja ja nuottikokoelmia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='fi'>
      <body className={inter.className}>
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  )
}
