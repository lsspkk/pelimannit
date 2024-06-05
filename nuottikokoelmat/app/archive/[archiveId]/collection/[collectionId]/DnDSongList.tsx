'use client'
import { PdfFileView, PdfFileViewParams } from '@/components/PdfFileView'
import { ChoiceOrder } from '@/models/choice'
import { Song } from '@/models/song'
import { useFileMapValue } from '@/stores/fileContext'
import { useSongViewStore } from '@/stores/SongViewContext'
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Types } from 'mongoose'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { DnDSongCard } from './DnDSongCard'

export const DnDSongList = ({ songs, saveSongOrder }: { songs: Song[]; saveSongOrder: (orderedSongs: ChoiceOrder[]) => Promise<void> }) => {
	const [dndSongs, setDndSongs] = React.useState(songs)
	const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 10 } }), useSensor(TouchSensor))
	const pathname = usePathname() ?? ''
	const router = useRouter()
	const { setSongView } = useSongViewStore()

	useEffect(() => {
		void saveSongOrder(dndSongs.map((s, index) => ({ songId: s._id, index })))
	}, [dndSongs, saveSongOrder])

	const [pdfDialogParams, setPdfDialogParams] = React.useState<PdfFileViewParams | null>(null)
	const fileMap = useFileMapValue()
	const onLoadPdf = (index: number) => {
		const song = songs[index]
		const file = fileMap?.get(song?._id as unknown as Types.ObjectId)
		if (file) {
			setPdfDialogParams({ fileUrl: URL.createObjectURL(file), songs, index: songs?.findIndex((s) => s._id === song._id) || 0, song })
		} else if (!pathname.endsWith('songview')) {
			router.push(pathname + '/songview')
			setSongView({ songs, index })
		}
	}

	const onDragEnd = (event: { active: any; over: any }) => {
		const { active, over } = event
		if (over && active.id !== over.id) {
			setDndSongs((items) => {
				const oldIndex = active.id as number
				const newIndex = over.id as number
				return arrayMove(items, oldIndex, newIndex)
			})
		}
	}

	return (
		<DndContext onDragEnd={onDragEnd} sensors={sensors}>
			<SortableContext items={dndSongs.map((song, index) => `${index}`)} strategy={verticalListSortingStrategy}>
				<div className='flex flex-col gap-4 w-full items-start'>
					{!pdfDialogParams &&
						dndSongs.map((song, index) => (
							<DnDSongCard key={String(song._id)} id={`${index}`} song={song} index={index} onLoadPdf={onLoadPdf} />
						))}
					{pdfDialogParams && (
						<PdfFileView
							pdfDialogParams={pdfDialogParams}
							onLoadPdf={onLoadPdf}
							onClose={() => setPdfDialogParams(null)}
						/>
					)}
				</div>
			</SortableContext>
		</DndContext>
	)
}
