import connectDB from '../../../utils/connectDb'
import auth from '../../../middlewares/auth'
import Order from '../../../models/Order'
import Product from '../../../models/Product'
import { ICategory, IDecode, IOrder, IProduct } from '../../../interfaces'
import { NextApiRequest, NextApiResponse } from 'next'


const updateProductStock = (products:IProduct<ICategory>[]):void => {
  products.forEach(async (prod:IProduct<ICategory>):Promise<void> => {
    const { inStock, sold } = prod

    await Product.findByIdAndUpdate(prod._id, { 
      sold: sold + prod.quantity,
      inStock: inStock - prod.quantity
    })
  })
}


connectDB()


export default async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  switch(req.method){
    case 'POST':
      await addNewOrder(req, res)
      break;
    
    case 'GET':
      await getAllOrders(req, res)
      break;
  }
}


const addNewOrder = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const { cart, total } = req.body
    const result = auth(req, res) as IDecode

    const order = new Order({
      userId: result.userId,
      cart, total
    })

    await order.save()

    res.status(201).json({ message: 'Payment success!', status: 'success' })
    updateProductStock(cart)

  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}


const getAllOrders = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try{
    const result = auth(req, res) as IDecode

    const orders:IOrder[] = await Order.find({ userId: result.userId }).select('-updatedAt')
    res.json({ orders: orders.reverse() })    
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}