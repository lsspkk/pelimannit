import mongoose, { Document, Model, model, Schema, Types } from "mongoose"
import { SongModel } from "../models/song"

const find = async (query: any) => {
	await mongoose.connect(process.env.MONGODB_URI || "", {})
	const songs = (await SongModel.find(query).exec()).sort((a, b) => {
		return a.path.localeCompare(b.path) * -1 || a.songname.localeCompare(b.songname)
	})

	console.log(songs.map((s) => s.songname))
	console.log(songs.length, "results")

	await mongoose.connection.close()
}

const deleteMany = async (query: any) => {
	await mongoose.connect(process.env.MONGODB_URI || "", {})
	await SongModel.deleteMany(query).exec()
	await mongoose.connection.close()
}

const mscz = { songname: { $regex: "mscz" } }
const klarinetti = { path: { $regex: "Klarinetti" } }
const aarela = { songname: { $regex: "Äärelä" } }

// find(klarinetti).then(() => deleteMany(klarinetti).then(() => find(klarinetti)))

find(aarela)
