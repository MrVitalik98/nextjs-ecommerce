import connectDB from '../../../utils/connectDb'
import User from '../../../models/User'
import Order from '../../../models/Order'
import auth from '../../../middlewares/auth'
import { NextApiRequest, NextApiResponse } from 'next'
import { IDecode, IUser } from '../../../interfaces'


connectDB()


export default async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  switch(req.method) {

    case 'GET':
      await getUser(req, res)
      break;

    case 'PATCH':
      await updateUserData(req, res)
      break;

    case 'DELETE':
      await deleteUserAccount(req, res)
      break;
  }
}


const getUser = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const result = auth(req, res) as IDecode

    const root:IUser = await User.findById(result.userId)
    if(root.role !== 'admin' ) return res.status(400).json({ message: 'Authorization is not valid', status: 'error' })

    const user:IUser = await User.findById(req.query.id).select('name email role _id')
    res.status(200).json({ user })

  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}


const updateUserData = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const result = auth(req, res) as IDecode

    const root:IUser = await User.findById(result.userId)
    if(root.role !== 'admin' ) return res.status(400).json({ message: 'Authorization is not valid', status: 'error' })
    
    const { name, email, isAdmin } = req.body
    const role = isAdmin ? 'admin' : 'user'

    await User.findByIdAndUpdate(req.query.id, {
      $set: {
        name,
        email,
        role
      }
    })

    res.status(200).json({ message: 'User data edited successfully', status: 'success' })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}


const deleteUserAccount = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const result = auth(req, res) as IDecode

    const root:IUser = await User.findById(result.userId)
    if(root.role !== 'admin' ) return res.status(400).json({ message: 'Authorization is not valid', status: 'error' })

    const user:IUser = await User.findByIdAndDelete(req.query.id)
    await Order.deleteMany({ userId: user._id })

    const users:IUser[] = await User.find().select('-createdAt -updatedAt -password')
    res.status(200).json({ users: users.reverse() })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}