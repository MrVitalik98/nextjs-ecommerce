import { NextPage } from 'next'
import React, { useContext, useEffect } from 'react'
import { showAlert, showLoader, hideLoader, authUser } from '../store/actions'
import { DataContext } from '../store/DataContext'
import { getData } from '../utils/fetchData'
import { ACTIONS } from '../store/types'
import Navbar from './Navbar'
import Toast from './Toast'
import Loader from './Loader'
import ScrollButton from './ScrollButton'
import { IContext, IUser } from '../interfaces'


interface IProps {
  children: React.ReactNode
}

interface IData {
  user?: IUser
  access_token?: string
  message?: string
  status?: string
}


const Layout:NextPage<IProps> = ({ children }) => {
  const { loading, dispatch } = useContext<IContext>(DataContext)


  useEffect(():void => {
    fetching()
  }, [])


  const fetching = async ():Promise<void> => {
    const token = localStorage.getItem('token')
    const data = JSON.parse(localStorage.getItem('_next_app_cart_'))

    data?.cart && dispatch({ type: ACTIONS.UPDATE_CART, payload: data?.cart })

    if(token) {
      dispatch(showLoader())
      const data = await getData<IData>('auth/accessToken')

      dispatch(hideLoader())

      if(data.message) {
        dispatch(showAlert({ message: data.message, status: data.status }))
        localStorage.removeItem('token')
        return
      }

      dispatch(authUser({ user: data.user, token: data.access_token }))
    }
  }


  return (
    <>
      {loading && <Loader />}
      <Navbar />

      <div className="container">
        <Toast />
        {children}
        <ScrollButton />
      </div>
    </>
  )
}


export default Layout
