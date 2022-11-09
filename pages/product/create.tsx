import Head from 'next/head'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FaChevronCircleLeft, FaTimes } from 'react-icons/fa'
import React, { useContext, useEffect, useState, useRef } from 'react'
import { ICategory, IContext, IImageData, IImage, IProduct, IAlert } from '../../interfaces'
import { hideLoader, showAlert, showLoader } from '../../store/actions'
import { DataContext } from '../../store/DataContext'
import { getData, postData } from '../../utils/fetchData'
import { imageUploader } from '../../utils/imageUploader'


interface IState {
  title: string
  category: string
  price: number
  inStock: number
  description: string
  content: string
}

const initialState:IState = {
  title: '',
  category: '',
  price: 0,
  inStock: 0,
  description: '',
  content: ''
}


const CreateProduct:NextPage = () => {
  const { loading, dispatch, auth } = useContext<IContext>(DataContext)
  const [product, setProduct] = useState<IState>(initialState)
  const [categories, setCategories] = useState<ICategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [images, setImages] = useState<File[]>([])
  const inputFile = useRef<HTMLInputElement>(null)
  const router = useRouter()


  useEffect(():void => {
    auth?.user?.role !== 'admin' && router.push('/')
  }, [auth?.user?.role])


  useEffect(():void => {
    fetchCategories()
  }, [])


  const fetchCategories = async ():Promise<void> => {
    dispatch(showLoader())

    const { categories } = await getData<{ categories: ICategory[] }>('account/categories', auth?.token)
    setCategories(categories)

    dispatch(hideLoader())
  }


  const handleChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>):void => {
    const { name, value } = e.target
    setProduct({ ...product, [name]: value })
  }


  const handleSelectCategory = (e:React.ChangeEvent<HTMLSelectElement>):void => {
    const { value } = e.target
    const category:ICategory = categories.find(ct => ct.name === value)

    setSelectedCategory(category.name)
    setProduct({ ...product, category: category._id })
  }


  const handleUploadFiles = (e:React.ChangeEvent<HTMLInputElement>):void => {
    const images:File[] = []
    const files:File[] = [...e.target.files]
    let n = 0
    let message = ''

    if(files.length) {
      files.forEach(file => {
        if(file.size > 1024 * 1024) {
          return message = 'The largest image size is 1mb'
        }

        if(!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
          return message = 'Image format is incorrect'
        }

        n++
        n <= 5 && images.push(file)
      })
      
      setImages(images)
    }

    message && dispatch(showAlert({ message, status: 'error' }))
  }


  const handleDeleteFile = (idx:number):void => setImages(images.filter((_, index):boolean => index !== idx))


  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>):Promise<void> => {
    e.preventDefault()

    if(!images.length) return dispatch(showAlert({ message: 'Please, select at least one image', status: 'error' }))

    dispatch(showLoader())
    
    const result:IImageData[] = await imageUploader(images)
    const imgArr:IImage[] = result.map(image => ({ url: image.secure_url }))
    
    const data:IProduct<string> = {
      ...product,
      price: +product.price,
      inStock: +product.inStock,
      images: imgArr
    }

    const res = await postData<IProduct<string>, IAlert>('products', data, auth?.token)
    dispatch(showAlert(res))

    router.push('/')
    dispatch(hideLoader())
  }



  return (
    <>
      <Head>
        <title>Create Product</title>
      </Head>

      <button className="btn btn-outline-dark mt-4 ml-2" id="back" onClick={() => router.back()}>
        <FaChevronCircleLeft />
        <span>Back</span>
      </button>
      

      <div className="create__product">
        <form 
          onSubmit={loading ? undefined : handleSubmit} 
          className="mx-auto px-2"
          noValidate
        >
          <div>
            <label htmlFor="title">Product Title</label>

            <input 
              type="text"
              id="title"
              name="title"
              className="form-control"
              value={product.title}
              onChange={handleChange}
              placeholder="Enter Title"
              disabled={loading}
              autoComplete="off"
              required
            />
          </div>
          

          <div className="my-3">
            <label>Categories</label>

            <select                 
              className="form-control custom-select" 
              value={selectedCategory || ''} 
              onChange={handleSelectCategory}
              disabled={loading}
              required
            >
              <option value="" className="d-none">Select a category</option>
              
              {categories?.length && categories?.map(category => {
                return (
                  <option 
                    key={category._id}
                    value={category.name}
                  >
                    {category.name}
                  </option>
                )
              })}
            </select> 
          </div>
          


          <div className="justify-content-between row">
            <div className="col-md-6 col-12">
              <label htmlFor="price">Price</label>
              <input 
                id="price"
                type="number"
                name="price"
                min="0"
                className="form-control"
                value={product.price || 0}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="col-md-6 col-12 mt-md-0 mt-3">
              <label htmlFor="inStock">In Stock</label>
              <input 
                id="inStock"
                type="number"
                name="inStock"
                min="0"
                className="form-control"
                value={product.inStock || 0}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="my-3">
            <label htmlFor="description">Description</label>
            
            <textarea 
              className="form-control"
              id="description"
              rows={4}
              name="description"
              value={product.description}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          
          <div>
            <label htmlFor="content">Content</label>
            
            <textarea 
              className="form-control"
              id="content"
              rows={4}
              name="content"
              value={product.content}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="border p-3 mt-3 input__file-box">
            <label 
              className="custom-file-upload"
            >
              <input 
                type="file"
                ref={inputFile}
                className="form-control border-0 d-none"
                disabled={loading}
                accept="image/*"
                onChange={handleUploadFiles}
                multiple={true}
                title=""
                required
              />
              Choose Images
            </label>

            <div className="my-2 images">
              {images?.length ? images?.map((image, idx) => {
                return (
                  <div 
                    className="image"
                    key={idx}
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={image.name}
                      className="img-thumbnail"
                    />

                    <button 
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDeleteFile(idx)}
                      disabled={loading}
                    >
                      <FaTimes />
                    </button>
                  </div>
                )
              }) : ''}
            </div>
          </div>
          
          <button 
            type="submit"
            className="btn btn-success my-4 float-right"
            disabled={loading}
          >
            Create
          </button>
        </form>
      </div>
    </>
  )
}


export default CreateProduct