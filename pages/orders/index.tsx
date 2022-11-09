import Head from 'next/head'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import { getData, deleteData } from '../../utils/fetchData'
import { DataContext } from '../../store/DataContext'
import { hideLoader, showAlert, showLoader, updateModalWindowDeleteProduct } from '../../store/actions'
import { IContext, IOrder } from '../../interfaces'
import OrderItem from '../../components/OrderItem'
import Modal from '../../components/modals/Modal'


interface IData {
  orders?: IOrder[]
  message?: string
  status?: string
}


const Orders:NextPage = () => {
  const { auth, dispatch, dataModalWindowDeleteProduct } = useContext<IContext>(DataContext)
  const [orders, setOrders] = useState<IOrder[]>([])
  const router = useRouter()

  useEffect(() => {
    !auth?.token && router.push('/signin')
  }, [auth?.token])


  useEffect(():void => {
    fetchOrders() 
  }, [])


  const fetchOrders = async ():Promise<void> => {
    dispatch(showLoader())

    const { orders } = await getData<{ orders: IOrder[] }>('orders', auth?.token)
    setOrders(orders)

    dispatch(hideLoader())
  }

  const handleClose = ():void => dispatch(updateModalWindowDeleteProduct({ isShow: false }))
  
  const handleDelete = async ():Promise<void> => {
    handleClose()
    dispatch(showLoader())

    const { orders, message, status } = await deleteData<IData>(`orders/${dataModalWindowDeleteProduct?._id}`, auth?.token)
    
    message && dispatch(showAlert({ message, status }))
    orders && setOrders(orders)
    dispatch(hideLoader())
  }


  
  return (
    <>
      <Head>
        <title>Orders</title>
      </Head>

      <div className="orders_page">
        <Modal
          isShow={dataModalWindowDeleteProduct?.isShow}
          callback={updateModalWindowDeleteProduct({ ...dataModalWindowDeleteProduct, isShow: true })}
          text="Do you want to delete this order permanently?"
          handleClose={handleClose}
          handleDelete={handleDelete}
        />

        { orders?.length 
          ? (
              <div className="orders">
                {orders.map(order => {
                  return <OrderItem key={order._id} order={order} />
                })}
              </div>
            ) 
          : <h5 className="text-danger noData">No orders</h5>
        }
      </div>
    </>
  )
}


export default Orders