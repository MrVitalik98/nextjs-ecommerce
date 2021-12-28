import { NextPage } from 'next'
import Cookies from 'js-cookie'
import { useContext, useState, useEffect } from 'react'
import { hideLoader, showAlert, showLoader, authUser } from '../store/actions'
import { DataContext } from '../store/DataContext'
import { deleteData, patchData } from '../utils/fetchData'
import { updateModalWindowDeleteAccount } from '../store/actions'
import Modal from './modals/Modal'
import { IAlert, IContext, IUser } from '../interfaces'


interface IState {
  name: string
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

interface IData {
  user?: IUser
  message?: string
  status?: string
}

const initialState:IState = {
  name: '',
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
}


const Settings:NextPage = () => {
  const [data, setData] = useState<IState>(initialState)
  const { auth, dispatch, dataModalWindowDeleteAccount } = useContext<IContext>(DataContext)

  useEffect(():void => {
    const form = {
      ...initialState,
      name: auth?.user?.name
    }

    setData(form)
  }, [auth])


  const handleChange = (e:React.ChangeEvent<HTMLInputElement>):void => {
    const { name, value } = e.target
    setData({
      ...data,
      [name]: value
    })
  }


  const handleUpdate = async ():Promise<void> => {
    dispatch(showLoader())

    const { user, message, status } = await patchData<IState, IData>('account/settings', data, auth?.token)
    message && dispatch(showAlert({ message, status }))

    user && dispatch(authUser({ token: auth?.token, user }))
    dispatch(hideLoader())
  }


  const handleClose = ():void => dispatch(updateModalWindowDeleteAccount({ isShow: false }))

  const handleDeleteAccount = async ():Promise<void> => {
    dispatch(showLoader())
    handleClose()

    const { message, status } = await deleteData<IAlert>('account/settings', auth?.token)
    dispatch(showAlert({ message, status }))

    if(status && status === 'success') {
      Cookies.remove('refresh_token', { path: 'api/auth/accessToken' })
      localStorage.removeItem('isLoading')
      dispatch(authUser({}))
    }

    dispatch(hideLoader())
  }



  return (
    <div className="settings">
      <Modal 
        isShow={dataModalWindowDeleteAccount?.isShow}
        callback={updateModalWindowDeleteAccount({ ...dataModalWindowDeleteAccount, isShow: true })}
        text='Do you want to delete account permanently?'
        handleClose={handleClose}
        handleDelete={handleDeleteAccount}
      />
      
      <h2>Settings</h2>

      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input 
          type="text" 
          className="form-control" 
          id="name" 
          name="name"
          value={data?.name || ''}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email address</label>
        <input 
          type="email" 
          className="form-control" 
          id="email" 
          value={auth?.user?.email || ''}
          disabled={true}
        />
      </div>

      <div className="form-group">
        <label htmlFor="currentPassword">Current Password</label>
        <input 
          type="password" 
          className="form-control" 
          id="currentPassword" 
          name="currentPassword"
          value={data?.currentPassword || ''}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="newPassword">New Password</label>
        <input 
          type="password" 
          className="form-control" 
          id="newPassword" 
          name="newPassword"
          value={data?.newPassword || ''}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmNewPassword">Confirm New Password</label>
        <input 
          type="password"
          className="form-control" 
          id="confirmNewPassword" 
          name="confirmNewPassword"
          value={data?.confirmNewPassword || ''}
          onChange={handleChange}
        />
      </div>

      <div className="btn-group">
        <button 
          className="btn btn-success" 
          onClick={handleUpdate}
        >
          Update
        </button>
       
        <button 
          className="btn btn-danger" 
          onClick={() => dispatch(updateModalWindowDeleteAccount({ isShow: true }))}
        >
          Delete Account
        </button>
      </div>
    </div>
  )
}


export default Settings