const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
import connectDB from '../../../utils/connectDb'
import Product from '../../../models/Product'
import { ICategory, IProduct } from '../../../interfaces'
import { NextApiRequest, NextApiResponse } from 'next'

connectDB()

interface IServerResponse {
  payment_method_id?: string
  payment_intent_id?: string
  total: number
  cart: IProduct<ICategory>[]
}


const mapCart = async (cart: IProduct<ICategory>[]): Promise<IProduct<ICategory>[]> => {
  const result:IProduct<ICategory>[] = []

  for await(let item of cart) {
    const product = await Product.findById(item._id)

    if(item.quantity > product.inStock) result.push({ ...item, inStock: product.inStock})
  }

  return result
}


export default async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  switch(req.method) {
    case 'POST':
      await startPayment(req, res)
      break;
  }
}


const startPayment = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    let intent:any
    const { payment_method_id, payment_intent_id, total, cart }:IServerResponse = req.body

    const result:IProduct<ICategory>[] = await mapCart(cart)
    if(result.length) return res.status(400).json({ message: `The Maximum quantity of ${result[0].title} product in stock - ${result[0].inStock}`, status: 'error' })


    if (payment_method_id) {
      intent = await stripe.paymentIntents.create({
        payment_method: payment_method_id,
        amount: total * 100,
        currency: 'usd',
        confirmation_method: 'manual',
        confirm: true
      })
    } else if (payment_intent_id) {
      intent = await stripe.paymentIntents.confirm(
        payment_intent_id
      )
    }

    res.send(generateResponse(intent))
  }catch (err) {
    return res.send({ message: err.message, status: 'error' })
  }
}


const generateResponse = (intent:any):{} => {
  if (
    intent.status === 'requires_action' &&
    intent.next_action.type === 'use_stripe_sdk'
  ) {
    return {
      requires_action: true,
      payment_intent_client_secret: intent.client_secret
    }
  } else if (intent.status === 'succeeded') {
    return {
      success: true
    }
  } else {
    return {
      error: 'Invalid PaymentIntent status'
    }
  }
}
