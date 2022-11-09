import Head from "next/head"
import { NextPage } from "next"
import { useRouter } from 'next/router'
import { FaChevronCircleLeft } from 'react-icons/fa'
import { useState, useContext, useEffect, useCallback } from "react"
import { getData } from '../../utils/fetchData'
import { DataContext } from '../../store/DataContext'
import { ICategory, IContext, IProduct } from "../../interfaces"


const numberFormat = (num:number):string => {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD'
  }).format(num)
}


const initialState:IProduct<ICategory> = {
  title: '', 
  price: 0, 
  category: { _id: '', name: '' }, 
  content: '',
  description: '', 
  quantity: 0, 
  inStock: 0,
  images: []
}


const Product:NextPage = () => {
  const [tab, setTab] = useState<number>(0)
  const [product, setProduct] = useState<IProduct<ICategory>>(initialState)
  const { auth } = useContext<IContext>(DataContext)
  const router = useRouter()
  
  useEffect(():void => {
    fetchProduct()
  }, [])

  const fetchProduct = async () => {
    const { product } = await getData<{ product: IProduct<ICategory> }>(`orders/${router?.query?.id}?productId=${router?.query?.productId}`, auth?.token)
    setProduct(product)
  }


  const isActive = useCallback((idx:number):string => {
    return idx === tab ? 'active' : ''
  }, [tab])

  const handleSelectImage = (idx:number):void => setTab(idx)


  return (
    <div className="product">
      <Head>
        <title>{product?.title}</title>
      </Head>

      <button className="btn btn-outline-dark" id="back" onClick={() => router.back()}>
        <FaChevronCircleLeft />
        <span>Back</span>
      </button>
      

      <div className="details">
        <div className="images_box">
          <img
            className="img-thumbnail rounded shadow"
            src={product?.images?.length && product?.images[tab]?.url || ''}
            alt={product?.title}
          />

          <div className="image-list">
            {product?.images?.map((image, idx) => {
              return (
                <img 
                  key={idx}
                  className={`rounded shadow img-thumbnail ${isActive(idx)}`}
                  src={image.url}
                  alt={product?.title}
                  onClick={() => handleSelectImage(idx)}
                />
              )
            })}
          </div>
        </div>

        <div className="content">
          <h2>{product?.title} {' '}
            <span className="badge bg-primary text-light">{product?.category?.name}</span>
          </h2>
          
          <div className="d-flex justify-content-between">
            <h6 className="text-danger">{numberFormat(product?.price)}</h6>
            <h6 className="text-danger">Quantity: {product?.quantity}</h6>
          </div>
          
          <p>{product?.description}</p>
          <p>{product?.content}</p>
        </div>
      </div>
    </div>
  )
}


export default Product