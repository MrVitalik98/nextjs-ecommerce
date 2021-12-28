import Head from 'next/head'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FaChevronCircleLeft } from 'react-icons/fa'
import React, { useEffect, useContext, useState } from 'react'
import { getData, patchData } from '../../utils/fetchData'
import { DataContext } from '../../store/DataContext'
import { hideLoader, showAlert, showLoader } from '../../store/actions'
import { IAlert, IContext, IUser } from '../../interfaces'


interface IData {
  name: string
  email: string
  isAdmin: boolean
}


const User:NextPage = () => {
  const { auth, loading, dispatch } = useContext<IContext>(DataContext)
  const [user, setUser] = useState<IUser>()
  const [isChecked, setIsChecked] = useState<boolean>(false)
  const router = useRouter()


  useEffect(():void => {
    fetchData()
  }, [])


  const fetchData = async () => {
    dispatch(showLoader())

    const data = await getData<{ user: IUser }>(`users/${router?.query?.userId}`, auth?.token)
    setUser(data?.user)
    setIsChecked(data?.user?.role === 'admin')

    dispatch(hideLoader())
  }


  useEffect(():void => {
    !auth?.user?.root && router.push('/')
  }, [auth?.user?.root])


  const handleCheck = (e:React.ChangeEvent<HTMLInputElement>):void => setIsChecked(e.target.checked)

  const handleChange = (e:React.ChangeEvent<HTMLInputElement>):void => {
    const { name, value } = e.target
    setUser({ ...user, [name]: value })
  }
  

  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>):Promise<void> => {
    e.preventDefault()
    const { name, email } = user

    const data:IData = {
      name, email,
      isAdmin: isChecked
    }

    dispatch(showLoader())

    const result = await patchData<IData, IAlert>(`users/${user?._id}`, data, auth?.token)
    dispatch(showAlert(result))

    result?.status === 'success' && router.back()

    dispatch(hideLoader())
  }


  return (
    <>
      <Head>
        <title>Edit | {user?.name}</title>
      </Head>
    
      <div className="edit-user">
        <div className="jumbotron">
          <button className="btn btn-outline-dark" id="back" onClick={() => router.back()}>
            <FaChevronCircleLeft />
            <span>Back</span>
          </button>
          
          <form className="editUserData" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="exampleInputName">User Name</label>
              <input 
                type="text"
                name="name"
                id="exampleInputName"
                className="form-control"
                value={user?.name || ''}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="exampleInputEmail">User Email</label>
              <input 
                type="email"
                name="email"
                id="exampleInputEmail"
                className="form-control"
                value={user?.email || ''}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-check">
              <input 
                type="checkbox"
                className="form-control"
                id="exampleCheck"
                checked={isChecked}
                onChange={handleCheck}
                disabled={loading}
              />
              <label className="form-check-label" htmlFor="exampleCheck">isAdmin</label>
            </div>

            <button type="submit" className="btn btn-primary">Update</button>
          </form>
        </div>
      </div>
    </>
  )
}

export default User