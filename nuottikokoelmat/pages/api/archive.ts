import type { NextApiRequest, NextApiResponse } from "next"
import { Archive, ArchiveModel } from "../../models/archive"
import { dbConnect } from "../../models/dbConnect"
import { hasApi } from "./config"

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
	try {
		if (hasApi(req.method, req.url)) {
			await apiHandler(req, res)
		} else {
			await mongoHandler(req, res)
		}
	} catch (error) {
		console.log(error)
		res.status(500).json({ error })
	}
}

const apiHandler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
	if (req.method === "POST") {
		const response = await fetch(`${process.env.API_URL}/api/v1/archive`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(req.body),
		})
		const json = await response.json()
		res.status(response.status).json(json)
	} else if (req.method === "GET") {
		const response = await fetch(`${process.env.API_URL}/api/v1/archive`)
		const json = await response.json()
		res.status(response.status).json(json)
	} else {
		res.status(500).json({ error: "method not supported" })
	}
}

const mongoHandler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
	await dbConnect()

	if (req.method === "POST") {
		const { createPassword, ...archive } = req.body as Archive & { createPassword: string }

		if (createPassword !== process.env.CREATE_PASSWORD || !createPassword) {
			res.status(401).json({ error: "wrong password" })
			return
		}

		const found = await ArchiveModel.find({ archivename: archive.archivename }).exec()
		if (found.length > 0) {
			res.status(400).json({ error: "archivename already exists" })
			return
		}

		const newArchive = new ArchiveModel(archive)
		const saved = await newArchive.save()
		res.status(201).json(saved)
	}
	if (req.method === "GET") {
		const archives = await ArchiveModel.find({}).exec()
		res.status(200).json([...archives])
	} else {
		res.status(500).json({ error: "method not supported" })
	}
}
