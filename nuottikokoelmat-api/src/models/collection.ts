import mongoose, { Document, Model, model, Schema, Types } from 'mongoose'

export interface Collection extends Partial<Document> {
  collectionname: string
  description?: string
  archiveId: Types.ObjectId
  created: Date
  modified: Date
}

export const CollectionSchema = new Schema<Collection>({
  collectionname: { type: String, required: true },
  description: { type: String },
  archiveId: { type: Schema.Types.ObjectId, required: true },
  created: { type: Date, required: true },
  modified: { type: Date, required: true },
})

export const CollectionModel = (mongoose.models?.Collection ||
  model<Collection>('Collection', CollectionSchema)) as unknown as Model<Collection>
