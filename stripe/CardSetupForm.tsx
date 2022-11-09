import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { DataContext } from '../store/DataContext'
import { postData } from '../utils/fetchData'
import { cleanCart, showLoader, showAlert, hideLoader } from '../store/actions'
import { IAlert, ICategory, IContext, IProduct } from '../interfaces'
import { PaymentMethodResult } from '@stripe/stripe-js'
import CardSection from './CardSection'


const numberFormat = (num:number):string => {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD'
  }).format(num)
}


interface IOrders {
  cart: IProduct<ICategory>[]
  total: number
}

interface ICartProduct {
  _id: string,
  title: string,
  quantity: number
}

interface IServerResponse {
  payment_method_id?: string
  payment_intent_id?: string
  total: number
  cart: ICartProduct[]
}



const CheckoutForm:React.FC = () => {
  const stripe = useStripe()
  const elements = useElements()
  const { auth, cart, dispatch, loading } = useContext<IContext>(DataContext)
  const [total, setTotal] = useState<number>(0)
  const [isDisable, setIsDisable] = useState<boolean>(false)
  const router = useRouter()


  useEffect(() => {
    setTotal(cart.reduce((sub, product) => sub + (product.price * product.quantity), 0))
  }, [cart])
  

  const handleServerResponse = async (response: any):Promise<void> => {
    const mapCart: ICartProduct[] = cart.map(item => ({
      _id: item._id,
      title: item.title,
      quantity: item.quantity
    }))


    if (response.error) {
      dispatch(showAlert({ message: response.error.message, status: 'error' }))
    } 
    else if (response.requires_action) {
      const { error: errorAction, paymentIntent } = await stripe.handleCardAction(response.payment_intent_client_secret)
  
      if (errorAction) {
        dispatch(showAlert({ message: errorAction.message, status: 'error' }))
      } 
      else {
        const serverResponse = await postData<IServerResponse, any>('stripe/checkout', { 
          payment_intent_id: paymentIntent.id, total, cart: mapCart 
        })

        handleServerResponse(serverResponse)
      }
    } 
    else {
      console.log(response)

      if(response.status !== 'error') {
        const data = await postData<IOrders, IAlert>('orders', { cart, total }, auth?.token)
        dispatch(cleanCart())
        dispatch(showAlert({ ...data }))  
      }

      dispatch(showAlert(response))
    }
  }

  
  const stripePaymentMethodHandler = async (result: any): Promise<void> => {
    dispatch(showLoader())

    const mapCart: ICartProduct[] = cart.map(item => ({
      _id: item._id,
      title: item.title,
      quantity: item.quantity
    }))


    if (result.error) {
      dispatch(showAlert({ message: result.error.message, status: 'error' }))
    } else {
      const data = await postData<IServerResponse, any>('stripe/checkout', {
        payment_method_id: result.paymentMethod.id, total, cart: mapCart
      })

      handleServerResponse(data)
    }

    dispatch(hideLoader())
  }

  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    if(!auth?.token) {
      router.push('/signin')
      dispatch(hideLoader())
      return 
    }

    if (!stripe || !elements) return

    setIsDisable(true)

    const result:PaymentMethodResult = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
      billing_details: {
        email: auth?.user?.email,
        name: auth?.user?.name,
      }
    })

    await stripePaymentMethodHandler(result)

    setIsDisable(false)
  }


  return (
    <form className="card-form" onSubmit={loading || isDisable ? undefined : handleSubmit}>
      <CardSection />
        <button 
          className="btn btn-dark" 
          type="submit" 
          disabled={!stripe || loading || isDisable}
        >
          Pay {numberFormat(total)}
        </button>
    </form>
  )
}


export default CheckoutForm