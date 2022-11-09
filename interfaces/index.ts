import React from 'react'
import { Schema, Document, Model } from 'mongoose'
import { ACTIONS } from '../store/types'


export type MongooseSchemaType = Schema<Document<any, any>, Model<any, any, any>, undefined>
export type MongooseModelType = Model<any, {}, {}>

export interface IAction {
  type: ACTIONS,
  payload?: any 
}

export interface IAlert {
  status: string,
  message: string
}

export interface IUser {
  _id?: string
  name: string
  email: string
  role: string
  root?: boolean
  avatar?: string
  password?: string
}

export interface IOrder {
  _id: string
  userId: string
  cart: IProduct<ICategory>[]
  total: number
  createdAt: string
}

export interface IAuth {
  user?: IUser
  token?: string
}

export interface IImage {
  url?: string
}

export interface IProduct<T> {
  _id?: string
  images?: IImage[]
  title: string
  content: string
  description: string
  checked?: boolean
  inStock: number
  sold?: number
  quantity?: number
  price: number
  creator?: string
  category?: T
}


export interface IModalData {
  _id?: string
  userId?: string
  isShow?: boolean
}

export interface IContext {
  message: string
  status: string
  auth: IAuth
  dispatch?: (fn:IAction | React.ReactNode) => void
  loading: boolean
  cart: IProduct<ICategory>[]
  dataModalWindowDeleteCategory: IModalData
  dataModalWindowDeleteProduct: IModalData
  dataModalWindowDeleteAccount: IModalData
  modalWindowDeleteOrAddAvatar: IModalData
  dataModalWindowDeleteProducts: IModalData
}

export interface IImageData {
  public_id: string
  secure_url: string
}

export interface IRegisterValidator {
  name: string
  email: string
  password: string 
  cf_password: string
}

export interface IPasswordValidator {
  newPassword: string
  confirmNewPassword: string
}

export interface ITokenPayload {
  userId: string
}

export interface ICategoryProduct {
  _id: string
  productId?: string
  title: string,
  inStock: number
  sold: number
  price: number
}

export interface ICategory {
  _id: string
  name: string
  creator?: string
  products?: ICategoryProduct[]
}

export interface IDecode {
  userId: string
}