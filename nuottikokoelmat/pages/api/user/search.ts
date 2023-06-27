import { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "../../../models/dbConnect";
import { User, UserModel } from "../../../models/user";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    await dbConnect();

    if (req.method === "POST") {
      const search: User = req.body as User;
      console.debug("-------------", search);
      const found = await UserModel.find({search}).exec();
      console.debug("-------------", found);
      res.status(200).json(found);
    } else {
      res.status(500).json({ error: "method not supported" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
}
