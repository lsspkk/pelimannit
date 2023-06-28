import mongoose, { Document, Model, model, Schema, Types } from 'mongoose'

export interface Rating extends Partial<Document> {
  rating: number
  userId: Types.ObjectId
  songId: Types.ObjectId
}

const RatingSchema = new Schema<Rating>({
  rating: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  songId: { type: Schema.Types.ObjectId, ref: 'Song' },
})

export const RatingModel = (mongoose.models?.Rating ||
  model<Rating>('Rating', RatingSchema)) as unknown as Model<Rating>
