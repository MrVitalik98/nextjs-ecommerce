import connectDB from '../../../../utils/connectDb'
import Category from '../../../../models/Category'
import Product from '../../../../models/Product'
import User from '../../../../models/User'
import auth from '../../../../middlewares/auth'
import { ICategory, ICategoryProduct, IDecode, IProduct } from '../../../../interfaces'
import { NextApiRequest, NextApiResponse } from 'next'


connectDB()


const mapCategories = (categories:ICategory[]):Promise<ICategory>[] => {
  return categories.map(async (category:ICategory & { _doc: ICategory }):Promise<ICategory> => {

    const products:ICategoryProduct[] = await Promise.all(category?.products?.map(async item => {
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
    case 'DELETE':
      await deleteProduct(req, res)
      break;
  }
}


const deleteProduct = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const result = auth(req, res) as IDecode
    const user = await User.findById(result.userId)

    if(user.role !== 'admin') return res.status(401).json({ message: 'Authentication is not valid', status: 'error' })

    const product:IProduct<string> = await Product.findByIdAndDelete(req.query.id)
    const category:ICategory & { save: () => Promise<void> } = await Category.findById(product.category)

    const fProducts:ICategoryProduct[] = category.products.filter((pr:ICategoryProduct):boolean => pr.productId !== product._id.toString())
    category.products = fProducts
    
    await category.save()
    
    const allCategories = await Category.find()
    const categories = await Promise.all(mapCategories(allCategories))

    res.status(200).json({ categories })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}