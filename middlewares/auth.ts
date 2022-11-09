import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'
import { IDecode } from '../interfaces'


type TypesAuthMiddleware = IDecode | void | string | JwtPayload


const authMiddleware = (req: NextApiRequest, res: NextApiResponse):TypesAuthMiddleware => {
  const token = req.headers.authorization
  if(!token) return res.status(401).json({ message: 'No Authorization ', status: 'error' })

  const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  if(!decode) return res.status(401).json({ message: 'No Authorization ', status: 'error' })

  return decode
}

export default authMiddleware
