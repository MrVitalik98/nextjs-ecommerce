import Head from 'next/head'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useContext, useState } from 'react'
import { getData } from '../utils/fetchData'
import { DataContext } from '../store/DataContext'
import { hideLoader, showLoader } from '../store/actions'
import { IContext, IUser } from '../interfaces'
import UsersDatatable from '../components/datatables/Users'


const Users:NextPage = () => {
  const { auth, dispatch } = useContext<IContext>(DataContext)
  const [users, setUsers] = useState<IUser[]>([])
  const router = useRouter()

  useEffect((): void => {
    auth?.user?.role !== 'admin' && router.push('/')
  }, [auth?.user?.role])


  useEffect(():void => {
    fetchData()
  }, [auth?.token])


  const fetchData = async ():Promise<void> => {
    dispatch(showLoader())

    const { users } = await getData<{ users: IUser[] }>('users', auth?.token)
    setUsers(users)

    dispatch(hideLoader())
  }



  return (
    <>
      <Head>
        <title>Users</title>
      </Head>

      <div className="users">
        {users?.length 
          ? <UsersDatatable _users={users}/> 
          : <h5 className="noData">No data</h5>
        }
      </div>
    </>
  )
}


export default Users