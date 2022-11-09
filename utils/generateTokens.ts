import jwt from 'jsonwebtoken'
import { ITokenPayload } from '../interfaces'

export const refreshToken = (payload: ITokenPayload):string => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET , { expiresIn: '7d' })
}

export const accessToken = (payload: ITokenPayload):string => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET , { expiresIn: '7d' })
}
