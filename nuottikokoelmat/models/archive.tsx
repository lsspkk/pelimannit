import exp from "constants";
import mongoose, { Document, Model, model, Schema } from "mongoose";

export interface Rating extends Partial<Document> {
  rating: number;
  userId: string;
}

export interface Song extends Partial<Document> {
  songname: string;
  path: string;
  url: string;
  dance?: string;
  tempo?: "slow" | "medium" | "fast";
  year?: number;
  rating: Rating[];
}

export interface Archive extends Partial<Document> {
  archivename: string;
  created: Date;
  modified: Date;
  url?: string;

  songs: Song[];
}

const RatingSchema = new Schema<Rating>({
  rating: { type: Number, required: true },
  userId: { type: String, required: true },
})

export const SongSchema = new Schema<Song>({
  songname: { type: String, required: true },
  path: { type: String, required: false },
  url: { type: String, required: true },
  dance: { type: String, required: false },
  tempo: { type: String, required: false },
  year: { type: Number, required: false },
  rating: [RatingSchema],})
export const ArchiveSchema = new Schema<Archive>({
  archivename: { type: String, required: true },
  created: { type: Date, required: true },
  modified: { type: Date, required: true },
  url: { type: String, required: false },
  songs: [SongSchema],
});

export const ArchiveModel = (mongoose.models?.Archive
  || model<Archive>("Archive", ArchiveSchema)) as unknown as Model<Archive>;
