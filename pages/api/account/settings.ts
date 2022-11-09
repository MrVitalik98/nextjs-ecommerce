import bcrypt from 'bcrypt'
import connectDB from '../../../utils/connectDb'
import User from '../../../models/User'
import Order from '../../../models/Order'
import auth from '../../../middlewares/auth'
import { passwordValidator } from '../../../utils/validator'
import { NextApiRequest, NextApiResponse } from 'next'
import { IDecode, IUser } from '../../../interfaces'


connectDB()


export default async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  switch(req.method) {
    case 'PUT':
      await editUserAvatar(req, res)
      break;

    case 'PATCH':
      await updateUserData(req, res)
      break;

    case 'DELETE':
      await deleteAccountById(req, res)
      break;
  }
}


const editUserAvatar = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try{
    const result = auth(req, res) as IDecode
    const { avatar } = req.body

    await User.findByIdAndUpdate(result.userId, { $set: { avatar } })

    const user:IUser = await User.findById(result.userId)

    const authorizedUser:IUser = {
      name: user.name,
      email: user.email,
      role: user.role,
      root: user.root,
      avatar: user.avatar
    }

    res.status(200).json({ user: authorizedUser })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}


const updateUserData = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    let hashedPassword:string
    const result = auth(req, res) as IDecode
    const { name, currentPassword, newPassword, confirmNewPassword } = req.body

    if(!name) return res.status(422).json({ message: 'Please write name', status: 'error' })
    if(name.length < 3) return res.status(422).json({ message: 'Name must be at least 3 characters', status: 'error' })

    if(currentPassword || newPassword || confirmNewPassword) {
      const user:IUser = await User.findOne({ _id: result.userId })
      const isMatch:boolean = await bcrypt.compare(currentPassword, user.password)

      if(!isMatch) return res.status(422).json({ message: 'Current password is wrong', status: 'error' })

      const errMsg:string | void = passwordValidator(req.body)
      if(errMsg) return res.status(422).json({ message: errMsg, status: 'error' })

      if(newPassword === currentPassword) return res.status(400).json({ message: 'The new password must not be the same as the current password', status: 'error' })

      hashedPassword = await bcrypt.hash(newPassword, 12)

      await User.findByIdAndUpdate(result.userId, {
        $set: { password: hashedPassword }
      })
    }

    
    await User.findByIdAndUpdate(result.userId, { $set: { name } })

    const user:IUser = await User.findById(result.userId)

    const authorizedUser:IUser = {
      name: user.name,
      email: user.email,
      role: user.role,
      root: user.root,
      avatar: user.avatar
    }

    res.status(200).json({ user: authorizedUser, message: 'User data has been successfully updated', status: 'success' })

  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}


const deleteAccountById = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const result = auth(req, res) as IDecode

    const user:IUser = await User.findByIdAndDelete(result.userId)
    if(!user) return res.status(400).json({ message: 'User does not exist', status: 'error' })

    await Order.deleteMany({ userId: user._id })
    res.status(200).json({ message: 'Account successfully deleted', status: 'success' })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}