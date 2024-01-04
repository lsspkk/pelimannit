import './globals.css'
import { Inter } from 'next/font/google'
import { SWRProvider } from './swr-provider'
import { FileMapProvider } from '@/models/fileContext'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Nuottiarkistot',
  description: 'Nuottiarkistoja ja nuottikokoelmia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='fi'>
      <body className={inter.className}>
        <FileMapProvider>
          <SWRProvider>{children}</SWRProvider>
        </FileMapProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
