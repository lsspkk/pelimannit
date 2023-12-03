import mongoose, { Schema, model, Model, Document } from 'mongoose'



export interface User extends Partial<Document> {
  username: string
  email: string
}


export const UserSchema = new Schema<User>({
  username: { type: String, required: true },
  email: { type: String, required: true },
})



export const UserModel = (mongoose.models?.User ||
  model<User>('User', UserSchema)) as unknown as Model<User>


export const isUnknownUser = (user: User) => {
  return user._id === ''
}

export const unknownUser = {
  _id: '',
  name: 'Tuntematon',
  email: '',
}
