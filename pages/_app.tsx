import 'react-toastify/dist/ReactToastify.css';
import { useReducer } from 'react'
import { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { DataContext } from '../store/DataContext'
import Layout from '../components/Layout'
import reducer from '../store/reducers'
import '../styles/globals.scss'
import { IContext } from '../interfaces';


const initialState:IContext = {
  message: '',
  status: '',
  auth: {},
  loading: false,
  cart: [],
  dataModalWindowDeleteCategory: {},
  dataModalWindowDeleteProduct: {},
  dataModalWindowDeleteAccount: {},
  modalWindowDeleteOrAddAvatar: {},
  dataModalWindowDeleteProducts: {}
}


const MyApp:NextPage<AppProps> = ({ Component, pageProps }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <DataContext.Provider value={{ ...state, dispatch }}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </DataContext.Provider>
  )
}

export default MyApp
