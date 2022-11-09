import { NextPage } from 'next'
import { useContext, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { IContext } from '../interfaces';
import { hideAlert } from '../store/actions';
import { DataContext } from '../store/DataContext'


const Toast:NextPage = () => {
  const { message, status, dispatch } = useContext<IContext>(DataContext)

  useEffect(():void => {
    if(message) {
      return toast[status](message, {
        onClose() {
          dispatch(hideAlert())
        }
      })
    }

    return 
  }, [message, status, dispatch])

  return <ToastContainer className="mt-5" autoClose={2000}/>
}


export default Toast