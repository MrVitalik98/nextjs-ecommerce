import { IAction, IAlert, IAuth, ICategory, IModalData, IProduct } from '../interfaces'
import { ACTIONS } from './types'

const { 
  SHOW_ALERT, HIDE_ALERT, SHOW_LOADER, HIDE_LOADER, 
  USER_DATA, UPDATE_CART, MODAL_WINDOW_DELETE_PRODUCT,
  MODAL_WINDOW_DELETE_CATEGORY, MODAL_WINDOW_DELETE_OR_ADD_AVATAR, 
  MODAL_WINDOW_DELETE_ACCOUNT, MODAL_WINDOW_DELETE_PRODUCTS 
} = ACTIONS




export const showAlert = (alert:IAlert):IAction => ({
  type: SHOW_ALERT,
  payload: alert
})


export const hideAlert = ():IAction => ({ type: HIDE_ALERT })
export const showLoader = ():IAction => ({ type: SHOW_LOADER })
export const hideLoader = ():IAction => ({ type: HIDE_LOADER })


export const authUser = (data:IAuth):IAction => ({
  type: USER_DATA,
  payload: data
})


export const addToCart = (product:IProduct<ICategory>, cart:IProduct<ICategory>[]):IAction => {
  const isNotExist:boolean = cart.every(p => p._id !== product._id)
  
  if(!isNotExist) return showAlert({ message: 'Product exist in cart', status: 'error' })

  const _cart_:IProduct<ICategory>[] = cart.concat(product)
  localStorage.setItem('_next_app_cart_', JSON.stringify({ cart: _cart_ }))
  
  return {
    type: UPDATE_CART,
    payload: _cart_
  }
}


export const deleteInCart = (productId:string, cart:IProduct<ICategory>[]):IAction => {
  const _cart_:IProduct<ICategory>[] = cart.filter(product => product._id.toString() !== productId.toString())

  localStorage.setItem('_next_app_cart_', JSON.stringify({ cart: _cart_ }))
  
  return {
    type: UPDATE_CART,
    payload: _cart_
  }
}


export const increase = (productId:string, cart:IProduct<ICategory>[]):IAction => {
  const _cart_:IProduct<ICategory>[] = cart.map(product => product._id === productId ? ({ ...product, quantity: product.quantity + 1 }) : product ) 

  localStorage.setItem('_next_app_cart_', JSON.stringify({ cart: _cart_ }))

  return {
    type: UPDATE_CART,
    payload: _cart_
  }
}

export const decrease = (productId:string, cart:IProduct<ICategory>[]):IAction => {
  const _cart_:IProduct<ICategory>[] = cart.map(product => product._id === productId ? ({ ...product, quantity: product.quantity - 1 }) : product ) 

  localStorage.setItem('_next_app_cart_', JSON.stringify({ cart: _cart_ }))

  return {
    type: UPDATE_CART,
    payload: _cart_
  }
}


export const cleanCart = ():IAction => {
  localStorage.removeItem('_next_app_cart_')

  return {
    type: UPDATE_CART,
    payload: []
  }
}


export const updateModalWindowDeleteProduct = (data:IModalData):IAction => ({
  type: MODAL_WINDOW_DELETE_PRODUCT,
  payload: data
})


export const updateModalWindowDeleteProducts = (data:IModalData):IAction => ({
  type: MODAL_WINDOW_DELETE_PRODUCTS,
  payload: data
})


export const updateModalWindowDeleteCategory = (data:IModalData):IAction => ({
  type: MODAL_WINDOW_DELETE_CATEGORY,
  payload: data
})


export const updateModalWindowDeleteAccount = (data:IModalData):IAction => ({
  type: MODAL_WINDOW_DELETE_ACCOUNT,
  payload: data
})


export const updateModalDeleteOrAddAvatar = (data:IModalData):IAction => ({
  type: MODAL_WINDOW_DELETE_OR_ADD_AVATAR,
  payload: data
})