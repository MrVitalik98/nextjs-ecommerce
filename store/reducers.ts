import { ACTIONS } from './types'
import { IAction } from '../interfaces'
const {
  SHOW_ALERT, HIDE_ALERT, SHOW_LOADER, HIDE_LOADER, 
  USER_DATA, UPDATE_CART, MODAL_WINDOW_DELETE_PRODUCT, 
  MODAL_WINDOW_DELETE_CATEGORY, MODAL_WINDOW_DELETE_OR_ADD_AVATAR,
  MODAL_WINDOW_DELETE_ACCOUNT, MODAL_WINDOW_DELETE_PRODUCTS
} = ACTIONS


export default function reducer(state: any, { type, payload }:IAction):any {
  switch(type) {
    case SHOW_LOADER:
      return { ...state, loading: true }

    case HIDE_LOADER:
      return { ...state, loading: false }
      
    case SHOW_ALERT:
      return { ...state, ...payload }

    case HIDE_ALERT:
      return { ...state, message: '', status: '' }

    case USER_DATA:
      return { ...state, auth: payload }

    case UPDATE_CART:
      return { ...state, cart: payload }

    case MODAL_WINDOW_DELETE_PRODUCT:
      return { ...state, dataModalWindowDeleteProduct: payload }

    case MODAL_WINDOW_DELETE_PRODUCTS:
      return { ...state, dataModalWindowDeleteProducts: payload }

    case MODAL_WINDOW_DELETE_CATEGORY:
      return { ...state, dataModalWindowDeleteCategory: payload }

    case MODAL_WINDOW_DELETE_OR_ADD_AVATAR:
      return { ...state, modalWindowDeleteOrAddAvatar: payload }

    case MODAL_WINDOW_DELETE_ACCOUNT:
      return { ...state, dataModalWindowDeleteAccount: payload }

    default:
      return state    
  }
}

