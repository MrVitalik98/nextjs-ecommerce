import React, { useContext, useEffect, useState } from 'react'
import Head from 'next/head'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Modal, Button } from 'react-bootstrap'
import { FaExclamationTriangle, FaPlus, FaTrashAlt } from 'react-icons/fa'
import { DataContext } from '../store/DataContext'
import { authUser, showLoader, hideLoader, updateModalDeleteOrAddAvatar, showAlert } from '../store/actions'
import { putData } from '../utils/fetchData'
import { imageUploader } from '../utils/imageUploader'
import { IContext, IImageData, IUser } from '../interfaces'
import Settings from '../components/Settings'


const Account:NextPage = () => {
  const { auth, dispatch, modalWindowDeleteOrAddAvatar } = useContext<IContext>(DataContext)
  const router = useRouter()
  const [userAvatar, setAvatar] = useState<File>()


  useEffect(():void => {
    !auth?.token && router.push('/signin')
  }, [auth?.token])


  const handleClose = ():void => {
    dispatch(updateModalDeleteOrAddAvatar({ isShow: false }))
  }


  const handleDeleteAvatar = async ():Promise<void> => {
    handleClose()
    dispatch(showLoader())

    const avatar:string = 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'
    const data = await putData<{ avatar: string }, { user: IUser }>('account/settings', { avatar }, auth?.token)

    dispatch(authUser({ token: auth?.token, user: data.user })) 
    dispatch(hideLoader())
  }


  const handleUploadAvatar = async ():Promise<void> => {
    handleClose()

    if(!userAvatar) return dispatch(showAlert({ message: 'Please select an image', status: 'error' }))

    dispatch(showLoader())

    const res:IImageData[] = await imageUploader([userAvatar])
    const data = await putData<{ avatar: string }, { user: IUser }>('account/settings', { avatar: res[0].secure_url }, auth?.token)
    
    dispatch(authUser({ token: auth?.token, user: data.user }))
    dispatch(hideLoader())
  }


  const handleChange = (e:React.ChangeEvent<HTMLInputElement>):void => {
    const file = e.target.files[0]
    
    if(!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) return dispatch(showAlert({ message: 'Image format is incorrect', status: 'error' }))
    if(file.size > 1024 * 1024) return dispatch(showAlert({ message: 'The largest image size is 1mb', status: 'error' }))

    setAvatar(file)
  }


  return (
    <>
      <Head>
        <title>{auth?.user?.name}</title>
      </Head>

      <Modal 
        show={modalWindowDeleteOrAddAvatar?.isShow} 
        onHide={() => dispatch(updateModalDeleteOrAddAvatar({ ...modalWindowDeleteOrAddAvatar, isShow: true }))}
      >
        <Modal.Header>
          {auth?.user?.avatar.includes('res.cloudinary.com') ? (
            <FaExclamationTriangle className="text-warning" />
          ) : (
            <h4 className="mb-0 mt-3">Upload New Avatar</h4>
          )}
        </Modal.Header>
        <Modal.Body>
          {auth?.user?.avatar.includes('res.cloudinary.com') ? (
            <p className="message">Do you want delete avatar?</p>
          ) : (
              <div className="input-group mb-4 px-3">
                <div className="custom-file">
                  <input 
                    type="file" 
                    className="custom-file-input" 
                    id="inputGroupFile01" 
                    accept="image/*"
                    onChange={handleChange}
                  />
                  <label 
                    className="custom-file-label" 
                    htmlFor="inputGroupFile01"
                  >
                    {userAvatar?.name || 'Choose file'}
                  </label>
                </div>
              </div>
          )}
          

        <div className="btn-group">
          <Button 
            variant="info" 
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            variant={auth?.user?.avatar.includes('res.cloudinary.com') ? "danger" : "success"}
            onClick={auth?.user?.avatar.includes('res.cloudinary.com') ? handleDeleteAvatar : handleUploadAvatar}
          >
            {auth?.user?.avatar.includes('res.cloudinary.com') ? 'Delete' : 'Upload'}
          </Button>
        </div>
        </Modal.Body>
      </Modal>

      <div className="account">
        <div className="sidebar border rounded">
          
          {auth?.token && (
            <>
              <div className="user-data">
                <img
                  className="avatar border"
                  src={auth?.user?.avatar}        
                  alt="avatar"
                />

                {auth?.user?.avatar.includes('res.cloudinary.com') ? (
                  <button 
                    className="delete-avatar btn btn-danger border"
                    onClick={() => dispatch(updateModalDeleteOrAddAvatar({ isShow: true }))}
                  >
                    <FaTrashAlt />
                  </button>
                ) : (
                  <button 
                    className="add-avatar btn btn-success border"
                    onClick={() => dispatch(updateModalDeleteOrAddAvatar({ isShow: true }))}
                  >
                    <FaPlus />
                  </button>
                )}
                
                <div className="content">
                  <h3>{auth?.user?.name || ''}</h3>
                  <h5 className="text-capitalize">{auth?.user?.root && 'Root '}{auth?.user?.role || ''}</h5>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="main">
          <Settings />
        </div>
      </div>
    </>
  )
}


export default Account