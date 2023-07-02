import mongoose, { Document, Model, model, Schema, Types } from 'mongoose'

export interface Choice extends Partial<Document> {
  songId: Types.ObjectId
  collectionId: Types.ObjectId
  created: Date
  index?: number
}

export const ChoiceSchema = new Schema<Choice>({
  songId: { type: Schema.Types.ObjectId, required: true },
  collectionId: { type: Schema.Types.ObjectId, required: true },
  created: { type: Date, required: true },
  index: { type: Number },
})

export const ChoiceModel = (mongoose.models?.Choice ||
  model<Choice>('Choice', ChoiceSchema)) as unknown as Model<Choice>
