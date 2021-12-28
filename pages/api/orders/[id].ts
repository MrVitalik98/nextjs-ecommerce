import connectDB from '../../../utils/connectDb'
import auth from '../../../middlewares/auth'
import Order from '../../../models/Order'
import { NextApiRequest, NextApiResponse } from 'next'
import { ICategory, IDecode, IOrder, IProduct } from '../../../interfaces'


connectDB()


export default async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  switch(req.method){
    case 'GET':
      await getProductById(req, res)
      break;

    case 'DELETE':
      await deleteOrderById(req, res)
      break;
  }
}


const getProductById = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const result = auth(req, res) as IDecode

    const { id, productId } = req.query
    
    const order:IOrder = await Order.findOne({ _id: id, userId: result.userId })
    if(!order) return res.status(400).json({ message: 'There is no product with this id in your orders', status: 'error' })

    const product:IProduct<ICategory> = order.cart.find(product => product._id === productId)
    res.status(200).json({ product })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}


const deleteOrderById = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const result = auth(req, res) as IDecode

    const order:IOrder = await Order.findOneAndRemove({ _id: req.query.id, userId: result.userId })
    if(!order) return res.status(400).json({ message: 'There is no product with this id in your orders', status: 'error' })

    const orders:IOrder[] = await Order.find({ userId: result.userId })
    res.status(200).json({ orders: orders.reverse(), message: 'Order deleted successfully', status: 'success' })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}