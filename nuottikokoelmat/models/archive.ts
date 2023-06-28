import mongoose, { Document, Model, model, Schema } from 'mongoose'

export interface Archive extends Partial<Document> {
  archivename: string
  created: Date
  modified: Date
  url?: string
}

export const ArchiveSchema = new Schema<Archive>({
  archivename: { type: String, required: true },
  created: { type: Date, required: true },
  modified: { type: Date, required: true },
  url: { type: String, required: false },
})

export const ArchiveModel = (mongoose.models?.Archive ||
  model<Archive>('Archive', ArchiveSchema)) as unknown as Model<Archive>
