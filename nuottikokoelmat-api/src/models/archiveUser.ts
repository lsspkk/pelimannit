import mongoose, { Schema, model, Model, Document } from 'mongoose'

export interface ArchiveUser {
  username: string
  archiveId: string
}

export interface StoredArchiveUser extends Partial<Document> {
  username: string
  archiveId: string
  passwordHash: string
}

export const ArchiveUserSchema = new Schema<StoredArchiveUser>({
  username: { type: String, required: true },
  archiveId: { type: String, required: true },
  passwordHash: { type: String, required: true },
})

export const ArchiveUserModel = (mongoose.models?.ArchiveUser ||
  model<StoredArchiveUser>('ArchiveUser', ArchiveUserSchema)) as unknown as Model<StoredArchiveUser>
