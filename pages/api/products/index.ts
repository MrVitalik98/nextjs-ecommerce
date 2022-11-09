import connectDB from '../../../utils/connectDb'
import Product from '../../../models/Product'
import Category from '../../../models/Category'
import User from '../../../models/User'
import auth from '../../../middlewares/auth'
import { NextApiRequest, NextApiResponse } from 'next'
import { ICategory, IDecode, IProduct, IUser } from '../../../interfaces'


connectDB()

const mapProducts = (products:any[]):Promise<any>[] => {
  return products.reverse().map(async product => {
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


const deleteProductsInCategory = async (products:[string, any[]][]):Promise<void> => {
  const data:[string, any[]][] = Object.entries(products)
  
  data.forEach(async item => {
    const ctg = await Category.findById(item[0])

    const fProducts = ctg.products.filter((p:any):boolean => item[1].every(id => id !== p.productId))
    ctg.products = fProducts

    await ctg.save()
  })
}



export default async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  switch(req.method) {
    case 'GET':
      await getAllProducts(req, res)
      break;

    case 'POST':
      await addNewProduct(req, res)
      break;

    case 'PATCH':
      await deleteCheckedProducts(req, res)
      break;
  }
}


const getAllProducts = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const products:IProduct<string>[] = await Product.find().select('-createdAt -updatedAt')
    const allProducts:IProduct<ICategory>[] = await Promise.all(mapProducts(products))
    const categories:ICategory[] = await Category.find()

    const mapCategories:ICategory[] = categories.map(category => ({
      _id: category._id,
      name: category.name
    }))
    
    res.status(200).json({ products: allProducts, categories: mapCategories })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}


const addNewProduct = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const result = auth(req, res) as IDecode
    const { title, category, description, content, images, price, inStock } = req.body

    const user:IUser = await User.findById(result.userId)
    if(user.role !== 'admin') return res.status(401).json({ message: 'Authentication is not valid', status: 'error' })

    const ctg = await Category.findById(category)

    const product:IProduct<string> = await Product.create({
      title, 
      category, 
      description, 
      content,
      images, 
      price, 
      inStock,
      creator: result.userId.toString()
    })

    ctg.products.push({ productId: product._id })
    await ctg.save()

    res.status(200).json({ message: 'Product successfully created', status: 'success' })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}


const deleteCheckedProducts = async (req:NextApiRequest, res:NextApiResponse):Promise<void> => {
  try {
    const result = auth(req, res) as IDecode
    const user = await User.findById(result.userId)

    if(user.role !== 'admin') return res.status(401).json({ message: 'Authentication is not valid', status: 'error' })

    const productIDS = req.body.map((product:IProduct<string>):string => product._id)
    await Product.deleteMany({ _id: { $in: [ ...productIDS ] }}).select('title')

    const reduceProducts:[string, any[]][] = req.body.reduce((acc:{}, prod:IProduct<string>) => {
      const list = acc[prod.category] || []

      acc[prod.category] = list.concat(prod._id)
      return acc
    }, {})

    await deleteProductsInCategory(reduceProducts)

    const allProducts:IProduct<string>[] = await Product.find().select('-createdAt -updatedAt')
    const products:IProduct<ICategory>[] = await Promise.all(mapProducts(allProducts))
    
    res.status(200).json({ products })
  }catch(err) {
    res.status(500).json({ message: err.message, status: 'error' })
  }
}