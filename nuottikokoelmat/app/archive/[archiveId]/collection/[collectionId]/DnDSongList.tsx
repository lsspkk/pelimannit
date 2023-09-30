'use client'
import React, { useEffect } from 'react'
import { Song } from '@/models/song'
import { ChoiceOrder } from '@/models/choice'
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DnDSongCard } from './DnDSongCard'
import { PdfDialog, PdfDialogParams } from '@/components/PdfDialog'
import { useFileMapValue } from '@/models/fileContext'
import { Types } from 'mongoose'
import { PdfIframe } from '@/components/PdfIframe'

export const DnDSongList = ({
  songs,
  saveSongOrder,
}: {
  songs: Song[]
  saveSongOrder: (orderedSongs: ChoiceOrder[]) => Promise<void>
}) => {
  const [dndSongs, setDndSongs] = React.useState(songs)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor)
  )

  useEffect(() => {
    void saveSongOrder(dndSongs.map((s, index) => ({ songId: s._id, index })))
  }, [dndSongs, saveSongOrder])

  const [pdfDialogParams, setPdfDialogParams] = React.useState<PdfDialogParams | null>(null)
  const fileMap = useFileMapValue()
  const [iframeIndex, setIframeIndex] = React.useState<number | null>(null)
  const onLoadPdf = (index: number) => {
    const song = songs[index]
    const file = fileMap?.get(song?._id as unknown as Types.ObjectId)
    if (file) {
      setPdfDialogParams({
        fileUrl: URL.createObjectURL(file),
        songs,
        index: songs?.findIndex((s) => s._id === song._id) || 0,
        song,
      })
      return
    }
    setIframeIndex(index)
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
  const showIframe = iframeIndex !== null

  return (
    <DndContext onDragEnd={onDragEnd} sensors={sensors}>
      <SortableContext items={dndSongs.map((song, index) => `${index}`)} strategy={verticalListSortingStrategy}>
        <div className='flex flex-col gap-4 w-full items-start'>
          {!pdfDialogParams &&
            !showIframe &&
            dndSongs.map((song, index) => (
              <DnDSongCard key={String(song._id)} id={`${index}`} song={song} index={index} />
            ))}
          {pdfDialogParams && (
            <PdfDialog
              pdfDialogParams={pdfDialogParams}
              onLoadPdf={onLoadPdf}
              onClose={() => setPdfDialogParams(null)}
            />
          )}
          {showIframe && (
            <PdfIframe iframeIndex={iframeIndex} setIframeIndex={setIframeIndex} songs={songs} onLoadPdf={onLoadPdf} />
          )}
        </div>
      </SortableContext>
    </DndContext>
  )
}
