import Link from 'next/link'
import { NextPage } from 'next'
import React, { useContext } from 'react'
import { DataContext } from '../store/DataContext'
import { addToCart, updateModalWindowDeleteProduct } from '../store/actions'
import { ICategory, IContext, IProduct } from '../interfaces'
import { FaEdit, FaCartPlus } from 'react-icons/fa'


interface IProps {
  product: IProduct<ICategory>
  handleCheck: (e: React.ChangeEvent<HTMLInputElement>) => void
}


// Number Format
const numberFormat = (num:number):string => {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD'
  }).format(num)
}


const ProductItem:NextPage<IProps> = ({ product, handleCheck }) => {
  const { _id, title, price, inStock, content, images, checked } = product
  const { auth, dispatch, cart } = useContext<IContext>(DataContext)

  const handleBuyProduct = (product:IProduct<ICategory>):void => dispatch(addToCart(product, cart))


  return (
    <div className="card" id={_id}>
      <div className="card-header">
        {auth?.user?.role === 'admin' && (
          <>
            <input 
              type="checkbox"
              className="form-control"
              checked={checked}
              onChange={handleCheck}
            />

            <button 
              className="btn btn-danger" 
              onClick={() => dispatch(updateModalWindowDeleteProduct({ isShow: true, _id: product._id }))}
            >
              <span>&times;</span>
            </button>
          </>
        )}

        <img 
          className="card-img-top" 
          src={images[0].url} 
          alt="Card image cap" 
        />
      </div>
      <div className="card-body">
        <Link href="/product/[id]" as={`/product/${_id}`}>
          <a className="card-title h3">{title}</a>
        </Link>

        <div className="row mt-1">
          <p className="text-danger">{numberFormat(price)}</p>
          
          {inStock > 0 ?
            <p className="text-danger">In Stock: {inStock}</p> :
            <p className="text-danger">Out Stock</p>
          }
        </div>
        
        <p className="card-text">{content}</p>

        <div className="btn-group">
          <button 
            className="btn btn-success" 
            onClick={inStock ? () => handleBuyProduct(product) : undefined}
            disabled={!inStock}
          >
            <FaCartPlus />
            <span>Buy</span>
          </button>

          {auth?.user?.role === 'admin' && (
            <Link href="/product/edit/[productId]" as={`/product/edit/${_id}`}>
              <button className="btn btn-info">
                <FaEdit />
                <span>Edit</span>
              </button>
            </Link>  
          )}
        </div>
      </div>
    </div>
  )
}


export default ProductItem
