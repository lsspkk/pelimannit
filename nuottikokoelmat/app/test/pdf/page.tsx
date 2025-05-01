'use client'

import React, { useEffect } from 'react'
{
	/* <head>
	<script src='/pdfjs/pdf.min.mjs' type='module' async />
</head> */
}
export default function Home() {
	const currentUrl = '/some_sample_file.pdf'

	const canvasRef = React.useRef<HTMLCanvasElement>(null)
	const pdfRef = React.useRef<any>(null)
	const [loaded, setLoaded] = React.useState(false)

	// render pdf into canvasRef
	const renderPdf = async () => {
		if (!loaded && pdfRef.current === null) {
			setLoaded(true)
			// @ts-ignore
			const pdfjs = window.pdfjsLib as typeof import('pdfjs-dist/types/src/pdf')
			pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'
			const pdf = await pdfjs.getDocument(currentUrl).promise
			pdfRef.current = pdf
			cachedPageRender(pdf)
		}
	}

	const pageRender = async (pdfjs: any) => {
		try {
			const page = await pdfjs.getPage(1)
			const scale = 1.5
			const viewport = page.getViewport({ scale })

			const canvas = canvasRef.current
			if (!canvas) {
				return
			}

			const context = canvas.getContext('2d')
			if (!context) {
				return
			}
			canvas.height = viewport.height
			canvas.width = viewport.width

			const renderContext = { canvasContext: context, viewport: viewport }

			await page.render(renderContext).promise
		} catch (error) {
			console.error(error)
		}
	}
	const cachedPageRender = React.useCallback(pageRender, [currentUrl])

	useEffect(() => {
		renderPdf()
	}, [renderPdf])

	return (
		<div className='flex-col align-center justify-center w-full2 m-12 gap-12 h-1/2 bg-gray-300 overflow-y-scroll overflow-x-hidden'>
			<div className='flex w-1/2  h-3/8 z-0 overflow-y-scroll'></div>
			<div className=' block w-full h-1/8 bg-cyan-500'>hei</div>

			<div className='flex w-1/2 h-1/8 z-0 overflow-y-scroll'>
				<canvas ref={canvasRef}></canvas>
			</div>
		</div>
	)
}
