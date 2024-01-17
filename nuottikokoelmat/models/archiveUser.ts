import mongoose, { Schema, model, Model, Document } from 'mongoose'

export interface ArchiveUser {
  username: string
  archiveId: string
  role: string 
}

export const ArchiveRole = {
  USER: 'user',
  MANAGER: 'manager',
}

export type ArchiveRole = typeof ArchiveRole[keyof typeof ArchiveRole]

export const hasRole = (obj: unknown, role: ArchiveRole): boolean => {
  const au = obj as ArchiveUser
  return au.username !== undefined && au.archiveId !== undefined && au.role === role
}

export interface StoredArchiveUser extends Partial<Document> {
  username: string
  archiveId: string
  passwordHash: string
  role: string
}

// not used
export const ArchiveUserSchema = new Schema<StoredArchiveUser>({
  username: { type: String, required: true },
  archiveId: { type: String, required: true },
  passwordHash: { type: String, required: true },
})


export const ArchiveUserModel = (mongoose.models?.ArchiveUser ||
  model<StoredArchiveUser>('ArchiveUser', ArchiveUserSchema)) as unknown as Model<StoredArchiveUser>
