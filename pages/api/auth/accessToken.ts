import User from '../../../models/User'
import connectDB from '../../../utils/connectDb'
import { accessToken } from '../../../utils/generateTokens'
import jwt from 'jsonwebtoken'
import { IDecode, IUser } from '../../../interfaces'
import { NextApiRequest, NextApiResponse } from 'next'

connectDB()

export default async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const rf_token:string = req.cookies.refresh_token
    if(!rf_token) return res.status(400).json({ message: 'You are not authorized. Please login now!', status: 'error' })

    const result = jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET) as IDecode
    if(!result) return res.status(400).json({ message: 'The token is invalid or has expired', status: 'error' })

    const user:IUser = await User.findById(result.userId)
    if(!user) return res.status(400).json({ message: 'User does not exist', status: 'error' })

    const authorizedUser = {
      name: user.name,
      email: user.email,
      role: user.role,
      root: user.root,
      avatar: user.avatar
    }

    const access_token = accessToken({ userId: user._id })

    res.json({ access_token, user: authorizedUser })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}
