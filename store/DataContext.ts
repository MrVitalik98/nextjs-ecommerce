import React, { createContext } from 'react'
import { IContext } from '../interfaces'

export const DataContext:React.Context<IContext> = createContext<IContext>({
  message: '',
  status: '',
  auth: {},
  dispatch() {},
  loading: false,
  cart: [],
  dataModalWindowDeleteCategory: {},
  dataModalWindowDeleteProduct: {},
  dataModalWindowDeleteAccount: {},
  modalWindowDeleteOrAddAvatar: {},
  dataModalWindowDeleteProducts: {}
})

