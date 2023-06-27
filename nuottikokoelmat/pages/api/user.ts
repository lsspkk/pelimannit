import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "../../models/dbConnect";
import { User, UserModel } from "../../models/user";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    await dbConnect();

    if (req.method === "POST") {
      const user = req.body as User;
      console.debug("-------------", user);

      const foundUsername = await UserModel.find({ username: user.username });
      if (foundUsername) {
        res.status(400).json({ error: "username already exists" });
        return;
      }
      const foundEmail = await UserModel.find({ email: user.email });
      if (foundEmail) {
        res.status(400).json({ error: "email already exists" });
        return;
      }
      const saved = await UserModel.create(user);
      console.debug("-------------", saved);
      res.status(201).json(saved);
    } else {
      res.status(500).json({ error: "method not supported" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
}
