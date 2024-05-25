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
			{
				/* Load the pdfjs-dist files from public, because of some nextjs issues
			claim that direct import does not work */
			}
			<head>
				<script src='/pdfjs/pdf.min.mjs' type='module' async />
			</head>
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
