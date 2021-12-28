import bcrypt from 'bcrypt'
import { NextApiRequest, NextApiResponse } from 'next'
import { IUser } from '../../../interfaces'
import User from '../../../models/User'
import connectDB from '../../../utils/connectDb'
import { accessToken, refreshToken } from '../../../utils/generateTokens'


connectDB()


export default async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  switch(req.method) {
    case 'POST':
      await login(req, res)
      break;
  }
}


const login = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const { email, password } = req.body

    const user:IUser = await User.findOne({ email })
    if(!user) return res.status(400).json({ message: 'Email or password is incorrect', status: 'error' })

    const isMatch:boolean = await bcrypt.compare(password, user.password)
    if(!isMatch) return res.status(400).json({ message: 'Email or password is incorrect', status: 'error' })

    const refresh_token:string = refreshToken({ userId: user._id })
    const access_token:string = accessToken({ userId: user._id })
    
    const authorizedUser:IUser = {
      name: user.name,
      email: user.email,
      role: user.role,
      root: user.root,
      avatar: user.avatar
    }

    res.json({ user: authorizedUser, access_token, refresh_token })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}