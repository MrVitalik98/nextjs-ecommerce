import User from '../../../models/User'
import connectDB from '../../../utils/connectDb'
import auth from '../../../middlewares/auth'
import { NextApiRequest, NextApiResponse } from 'next'
import { IDecode, IUser } from '../../../interfaces'

connectDB()


export default async (req: NextApiRequest, res: NextApiResponse):Promise<void> => {
  switch(req.method) {
    case 'GET':
      await getUsers(req, res)
      break;
  }
}


const getUsers = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const result = auth(req, res) as IDecode
    const user = await User.findById(result.userId)

    if(user.role !== 'admin') return res.status(401).json({ message: 'Authentication is not valid', status: 'error' })

    const users:IUser[] = await User.find().select('-password -createdAt -updatedAt')
    res.status(200).json({ users: users.reverse() })

  }catch(err) {
    res.status(400).json({ message: err.message, status: 'error' })
  }
}

