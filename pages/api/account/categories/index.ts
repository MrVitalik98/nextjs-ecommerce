import connectDB from '../../../../utils/connectDb'
import Category from '../../../../models/Category'
import Product from '../../../../models/Product'
import User from '../../../../models/User'
import auth from '../../../../middlewares/auth'
import { ICategory, ICategoryProduct, IDecode, IProduct, IUser } from '../../../../interfaces'
import { NextApiRequest, NextApiResponse } from 'next'


connectDB()


const mapCategories = (categories:ICategory[]):Promise<ICategory>[] => {
  return categories.map(async (category:ICategory & { _doc: ICategory }):Promise<ICategory> => {

    const products = await Promise.all(category?.products?.map(async (item:ICategoryProduct):Promise<ICategoryProduct> => {
      const product:IProduct<string> = await Product.findById(item.productId)

      return {
        _id: product._id,
        title: product.title,
        inStock: product.inStock,
        sold: product.sold,
        price: product.price
      }
    }))
    

    return {
      ...category._doc,
      products
    }
  })
}


export default async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  switch(req.method) {
    case 'GET':
      await getCategories(req, res)
      break;

    case 'POST':
      await addNewCategory(req, res)
      break;
  }
}


const getCategories = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const result = auth(req, res) as IDecode
    const user:IUser = await User.findById(result.userId)
    
    if(user.role !== 'admin') return res.status(401).json({ message: 'Authentication is not valid', status: 'error' })

    const allCategories:ICategory[] = await Category.find().select('-createdAt -updatedAt')
    const categories:ICategory[] = await Promise.all(mapCategories(allCategories))

    res.status(200).json({ categories })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}


const addNewCategory = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const result = auth(req, res) as IDecode
    const user:IUser = await User.findById(result.userId)

    if(user.role !== 'admin') return res.status(401).json({ message: 'Authentication is not valid', status: 'error' })

    const category:ICategory = await Category.findOne({ name: req.body.name })

    if(!category) {
      await Category.create({
        name: req.body.name,
        products: [],
        creator: result.userId
      })
    }
    
    const allCategories:ICategory[] = await Category.find().select('-createdAt -updatedAt')
    const categories:ICategory[] = await Promise.all(mapCategories(allCategories))

    if(category) return res.status(400).json({ categories, message: 'A category with the same name already exists', status: 'error' })

    res.status(200).json({ categories })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}
