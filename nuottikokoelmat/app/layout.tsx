import './globals.css'
import { FileMapProvider } from '@/stores/fileContext'
import { SongViewProvider } from '@/stores/SongViewContext'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Inter } from 'next/font/google'
import { SWRProvider } from './swr-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = { title: 'Nuottiarkistot', description: 'Nuottiarkistoja ja nuottikokoelmia' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='fi'>
			<body className={inter.className}>
				<FileMapProvider>
					<SongViewProvider>
						<SWRProvider>{children}</SWRProvider>
					</SongViewProvider>
				</FileMapProvider>
				<SpeedInsights />
			</body>
		</html>
	)
}
