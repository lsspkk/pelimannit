import { User, UserModel } from '../../../models/user'

import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../models/dbConnect'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { userId } = req.query
  if (!userId) {
    res.status(400).json({ error: 'userId missing' })
    return
  }
  const id = typeof userId === 'string' ? userId : userId[0]

  try {
    await dbConnect()
    if (req.method === 'PUT') {
      const user: User | null = await UserModel.findById(id).exec()

      if (!user) {
        res.status(401).json({ error: `käyttäjää ${id} ei löydy` })
      } else {
        if (req.body.username !== undefined && req.body.username !== user.username) {
          user['username'] = req.body.username
        }
        console.log('updating user', user)
        user.save && (await user.save())
        res.status(201).json(user)
      }
    }
    if (req.method === 'GET') {
      console.debug('GET user', userId)
      const users: Array<User> = await UserModel.find({
        _id: userId,
      }).exec()
      if (users.length !== 1) {
        res.status(404).json({})
        return
      }
      const { _id, username, email } = users[0]
      res.status(200).json({ _id: `${_id}`, username, email })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
