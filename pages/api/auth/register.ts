import bcrypt from 'bcrypt'
import connectDB from '../../../utils/connectDb'
import User from '../../../models/User'
import { registerValidator } from '../../../utils/validator'
import { NextApiRequest, NextApiResponse } from 'next'


connectDB()


export default async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  switch(req.method) {
    case 'POST':
      await register(req, res)
      break;
  }
}


const register = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const { name, email, password } = req.body

    const errMsg:string | void = registerValidator(req.body)
    if(errMsg) return res.status(422).json({ message: errMsg, status: 'error' })

    const emailExists:boolean = await User.findOne({ email })
    if(emailExists) return res.status(400).json({ message: 'Email exists', status: 'error'})

    const passwordHash:string = await bcrypt.hash(password, 12)

    await User.create({
      name, 
      email,
      password: passwordHash
    })

    res.status(201).json({ message: 'Register Success!', status: 'success' })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}