import { User, UserModel } from "../../../models/user";

import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "../../../models/dbConnect";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { userId } = req.query;

  try {
    await dbConnect();
    if (req.method === "PUT") {
      const user: User = await UserModel.findById(userId[0]);

      if (user === undefined) {
        res.status(401).json({ error: `käyttäjää ${userId[0]} ei löydy` });
      } else {
        if (req.body.username !== undefined && req.body.username !== user.username) {
          user["username"] = req.body.username;
        }
        console.log("updating user", user);
        await user.save();
        res.status(201).json(user);
      }
    }
    if (req.method === "GET") {
      console.debug("GET user", userId);
      const users: Array<UserInterface> = await UserModel.find({
        _id: userId,
      })
        .exec();
      if (users.length !== 1) {
        res.status(404).json({});
        return;
      }
      console.debug("---------------", users);
      const { _id, username, email } = users[0];
      res.status(200).json({ _id: `${_id}`, username, email });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
}
