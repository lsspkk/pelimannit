import mongoose, { Document, Model, model, Schema } from 'mongoose'

export interface UrlAlternative {
  priority: number
  alternative?: string
}

export interface Archive extends Partial<Document> {
	archivename: string
	created: Date
	modified: Date
	url?: string
	driveId?: string
	visitorPassword?: string
	urlAlternatives?: UrlAlternative[]
}

export const ArchiveSchema = new Schema<Archive>({
	archivename: { type: String, required: true },
	created: { type: Date, required: true },
	modified: { type: Date, required: true },
	url: { type: String, required: false },
	driveId: { type: String, required: false },
	visitorPassword: { type: String, required: false },
	urlAlternatives: [{ priority: { type: Number, required: true }, alternative: { type: String, required: false } }],
})

export const ArchiveModel = (mongoose.models?.Archive || model<Archive>('Archive', ArchiveSchema)) as unknown as Model<Archive>
