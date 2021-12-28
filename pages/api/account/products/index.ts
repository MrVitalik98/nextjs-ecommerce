import connectDB from '../../../../utils/connectDb'
import Category from '../../../../models/Category'
import Product from '../../../../models/Product'
import User from '../../../../models/User'
import auth from '../../../../middlewares/auth'
import { ICategory, IDecode, IProduct, IUser } from '../../../../interfaces'
import { NextApiRequest, NextApiResponse } from 'next'


connectDB()


const mapProducts = (products:IProduct<string>[]):Promise<IProduct<ICategory>>[] => {
  return products.reverse().map(async (product:IProduct<string> & { _doc: IProduct<string> }):Promise<IProduct<ICategory>> => {
    const category = await Category.findById(product.category)

    return {
      ...product._doc,
      category: { 
        _id: category._id,
        name: category.name 
      }
    }
  })
}


export default async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  switch(req.method) {
    case 'GET':
      await getUserProducts(req, res)
      break;
  }
}


const getUserProducts = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const result = auth(req, res) as IDecode
    const user:IUser = await User.findById(result.userId)

    if(user.role !== 'admin') return res.status(401).json({ message: 'Authentication is not valid', status: 'error' })

    const allProducts:IProduct<string>[] = await Product.find({ creator: result.userId }).select('-createdAt -updatedAt')
    const categories:ICategory[] = await Category.find()
    const products:IProduct<ICategory>[] = await Promise.all(mapProducts(allProducts))

    const mapCategories = categories.map((category:ICategory):ICategory => ({
      _id: category._id,
      name: category.name
    }))

    res.status(200).json({ products, categories: mapCategories })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}