import mongoose, { Document, Model, model, Schema, Types } from 'mongoose'

export interface Song extends Partial<Document> {
  songname: string
  path: string
  url: string
  dance?: string
  tempo?: 'slow' | 'medium' | 'fast'
  year?: number
  archiveId: Types.ObjectId
}

export type SongNoArchiveId = Omit<Song, 'archiveId'>

export const SongSchema = new Schema<Song>({
  songname: { type: String, required: true },
  path: { type: String, required: false },
  url: { type: String, required: true },
  dance: { type: String, required: false },
  tempo: { type: String, required: false },
  year: { type: Number, required: false },
  archiveId: { type: Schema.Types.ObjectId, ref: 'Archive' },
})

export const SongModel = (mongoose.models?.Song || model<Song>('Song', SongSchema)) as unknown as Model<Song>
