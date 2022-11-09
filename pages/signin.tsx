import { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Router from 'next/router'
import Cookie from 'js-cookie'
import React, { useState, useContext, useEffect } from 'react'
import { postData } from '../utils/fetchData'
import { DataContext } from '../store/DataContext'
import { showAlert, showLoader, hideLoader, authUser } from '../store/actions'
import { IContext, IUser } from '../interfaces'


interface IState {
  email: string
  password: string
}

interface IData {
  user?: IUser
  refresh_token?: string
  access_token?: string
  message?: string
  status?: string
}

const initialState:IState = { email: '', password: '' }


const SignIn:NextPage = () => {
  const [form, setForm] = useState<IState>(initialState)
  const { email, password } = form
  const { dispatch, auth, loading } = useContext<IContext>(DataContext)


  useEffect(():void => {
    auth?.token && Router.push('/account')
  }, [auth])


  const handleChange = (e:React.ChangeEvent<HTMLInputElement>):void => {
    const { value, name } = e.target
    setForm({
      ...form,
      [name]: value
    })
  }


  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>):Promise<void> => {
    e.preventDefault()
    dispatch(showLoader())

    const data = await postData<IState, IData>('auth/login', form)
    dispatch(hideLoader())

    if(data?.message) {
      dispatch(showAlert({ message: data.message, status: data.status }))
      return 
    }
    
    dispatch(authUser({ user: data?.user, token: data?.access_token }))

    Cookie.set('refresh_token', data?.refresh_token, { 
      path: 'api/auth/accessToken',
      expires: 7
    })

    localStorage.setItem('token', data?.refresh_token)

    setForm(initialState)
    Router.push('/')
  }

  
  return (
    <div className="login_page">
      <Head>
        <title>Sign in</title>
      </Head>

      <h2 className="text-center">Sign In</h2>

      <form className="mx-auto my-4" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="exampleInputEmail1">Email address</label>
          <input 
            type="email" 
            className="form-control" 
            id="exampleInputEmail1" 
            value={email}
            name="email"
            onChange={handleChange}
            aria-describedby="emailHelp" 
            disabled={loading}
            required
          />
          <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
        </div>

        <div className="form-group">
          <label htmlFor="exampleInputPassword1">Password</label>
          <input 
            type="password" 
            className="form-control" 
            id="exampleInputPassword1" 
            value={password}
            name="password"
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-dark w-100"
          disabled={loading}
        >
          Login
        </button>

        <p className="my-2">You don`t have an account? {' '}
          <Link href="/register">
            <a style={{color: 'crimson', textDecoration: 'underline'}}>Register</a>
          </Link>
        </p>
      </form>
    </div>
  )
}


export default SignIn