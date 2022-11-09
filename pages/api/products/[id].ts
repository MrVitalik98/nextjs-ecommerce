import connectDB from '../../../utils/connectDb'
import Product from '../../../models/Product'
import Category from '../../../models/Category'
import User from '../../../models/User'
import auth from '../../../middlewares/auth'
import { ICategory, ICategoryProduct, IDecode, IProduct, IUser } from '../../../interfaces'
import { NextApiRequest, NextApiResponse } from 'next'



const mapProduct = async (product:IProduct<string> & { _doc: IProduct<string> }):Promise<IProduct<ICategory>> => {
  const category = await Category.findById(product.category)

  return {
    ...product._doc,
    category: { 
      _id: category._id,
      name: category.name 
    }
  }
}


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


connectDB()


export default async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  switch(req.method) {
    case 'GET':
      await getProduct(req, res)
      break;

    case 'DELETE':
      await deleteProduct(req, res)
      break;

    case 'PATCH':
      await editProduct(req, res)
      break;
  }
}


const getProduct = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const product:IProduct<string> & { _doc: IProduct<string> } = await Product.findById(req.query.id).select('-createdAt -updatedAt')
    
    if(!product) return res.status(400).json({ message: 'This product does not exist', status: 'error' })

    const _product_:IProduct<ICategory> = await mapProduct(product)
    res.status(200).json({ product: _product_ })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}


const deleteProduct = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const result = auth(req, res) as IDecode
    const user = await User.findById(result.userId)

    if(user.role !== 'admin') return res.status(401).json({ message: 'Authentication is not valid', status: 'error' })

    const product:IProduct<string> = await Product.findByIdAndDelete(req.query.id)
    const category:ICategory & { save: () => Promise<void> } = await Category.findById(product.category)

    const fProducts:ICategoryProduct[] = category.products.filter(pr => pr.productId !== product._id.toString())
    category.products = fProducts
    
    await category.save()
    
    const products:IProduct<string>[] = await Product.find().select('-createdAt -updatedAt')
    const allProducts:IProduct<ICategory>[] = await Promise.all(mapProducts(products))
    
    res.status(200).json({ products: allProducts })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}


const editProduct = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const result = auth(req, res) as IDecode
    const { title, category, description, content, price, inStock, images } = req.body

    const user:IUser = await User.findById(result.userId)
    if(user.role !== 'admin') return res.status(401).json({ message: 'Authentication is not valid', status: 'error' })

    const product:IProduct<string> = await Product.findById(req.query.id)
    
    if(product.category !== category) {
      const newCategory = await Category.findById(category)
      const currentCategory = await Category.findById(product.category)

      const fProducts = currentCategory.products.filter((p:{ productId: string }):boolean => p.productId !== product._id.toString())

      newCategory.products.push({ productId: product._id })
      currentCategory.products = fProducts

      await newCategory.save()
      await currentCategory.save()
    }

    await Product.findByIdAndUpdate(req.query.id, {
      $set: {
        title, 
        category, 
        description, 
        content, 
        price, 
        inStock, 
        images
      }
    })
   
    res.status(200).json({ message: 'Product successfully edited', status: 'success' })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}