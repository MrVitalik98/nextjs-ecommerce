import Head from "next/head"
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FaChevronCircleLeft, FaCartPlus } from 'react-icons/fa'
import { useState, useContext, useCallback } from "react"
import { getData } from '../../utils/fetchData'
import { DataContext } from '../../store/DataContext'
import { addToCart } from "../../store/actions"
import { ICategory, IContext, IProduct } from "../../interfaces"


interface IServerSideProps {
  props: {
    product: IProduct<ICategory>
  }
}

interface IProps {
  product: IProduct<ICategory>
}


const numberFormat = (num:number):string => {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD'
  }).format(num)
}


export const getServerSideProps = async ({ query }):Promise<IServerSideProps> => {
  const res = await getData<{ product: IProduct<ICategory> }>(`products/${query.id}`)
  
  return {
    props: {
      product: res?.product
    }
  }
}


const Product:NextPage<IProps> = ({ product }) => {
  const { title, images, price, inStock, description, category, content, sold } = product
  const [tab, setTab] = useState<number>(0)
  const { cart, dispatch } = useContext<IContext>(DataContext)
  const router = useRouter()


  const isActive = useCallback((idx:number):string => idx === tab ? 'active' : '', [tab])

  const handleSelectImage = (idx:number):void => setTab(idx)

  const handleBuyProduct = ():void => dispatch(addToCart(product, cart))


  return (
    <div className="product">
      <Head>
        <title>{title} | {category?.name}</title>
      </Head>

      <button className="btn btn-outline-dark" id="back" onClick={() => router.back()}>
        <FaChevronCircleLeft />
        <span>Back</span>
      </button>
      

      <div className="details">
        <div className="images_box">
          <img
            className="img-thumbnail rounded shadow"
            src={images[tab].url}
            alt={title}
          />

          <div className="image-list">
            {images.map((image, idx) => {
              return (
                <img 
                  key={idx}
                  className={`rounded shadow img-thumbnail ${isActive(idx)}`}
                  src={image.url}
                  alt={title}
                  onClick={() => handleSelectImage(idx)}
                />
              )
            })}
          </div>
        </div>

        <div className="content">
          <h2>{title}</h2>
          <h6 className="text-danger">{numberFormat(price)}</h6>
          <div className="text-danger d-flex justify-content-between">
            { inStock > 0 ? 
              <h6 className="text-danger">In Stock: {inStock}</h6> :
              <h6 className="txt-danger">Out Stock</h6>
            }

            <h6 className="text-danger">Sold: {sold}</h6>
          </div>

          <p>{description}</p>
          <p>{content}</p>

          <button 
            className="btn btn-success float-right mt-2"
            onClick={inStock ? () => handleBuyProduct() : undefined}
            disabled={!inStock}
            id="buy"
          >
            <FaCartPlus />
            <span>Buy</span>
          </button>
        </div>
      </div>
    </div>
  )
}


export default Product