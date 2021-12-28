import Head from 'next/head'
import Link from 'next/link'
import { NextPage } from 'next'
import Router from 'next/router'
import React, { useState, useContext, useEffect } from 'react'
import { postData } from '../utils/fetchData'
import { DataContext } from '../store/DataContext'
import { showAlert, showLoader, hideLoader } from '../store/actions'
import { IAlert, IContext } from '../interfaces'


interface IState {
  name: string
  email: string
  password: string
  cf_password: string
}


const initialState:IState = {
  name: '',
  email: '',
  password: '',
  cf_password: ''
}


const Register:NextPage = () => {
  const [form, setForm] = useState<IState>(initialState)
  const { name, email, password, cf_password } = form
  const { dispatch, auth, loading } = useContext<IContext>(DataContext)


  useEffect(():void => {
    auth?.token && Router.push('/account')
  }, [auth])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>):void => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    dispatch(showLoader())

    const res = await postData<IState, IAlert>('auth/register', form)
    dispatch(showAlert(res))
    dispatch(hideLoader())

    res.status === 'success' && Router.push('/signin')
  }


  return (
    <div>
      <Head>
        <title>Register</title>
      </Head>

      <h2 className="text-center my-4">Register</h2>
      <form className="mx-auto my-4" style={{maxWidth: '500px'}} onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="exampleInputName">Name</label>
          <input 
            type="text" 
            className="form-control" 
            id="exampleInputName"
            name="name" 
            value={name}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="exampleInputEmail">Email address</label>
          <input 
            type="email" 
            className="form-control" 
            id="exampleInputEmail" 
            aria-describedby="emailHelp" 
            name="email"
            value={email}
            onChange={handleChange}
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
            name="password"
            value={password}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="exampleInputPassword2">Confirm Password</label>
          <input 
            type="password" 
            className="form-control" 
            id="exampleInputPassword2" 
            name="cf_password"
            value={cf_password}
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
          Register
        </button>

        <p className="my-2">Already have an account? {' '}
          <Link href="/signin">
            <a style={{color: 'crimson', textDecoration: 'underline'}}>Login Now</a>
          </Link>
        </p>
      </form>
    </div>
  )
}


export default Register