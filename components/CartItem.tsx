import Link from "next/link"
import { NextPage } from 'next'
import { useContext } from 'react'
import { decrease, increase, updateModalWindowDeleteProduct } from '../store/actions'
import { DataContext } from '../store/DataContext'
import { ICategory, IProduct } from "../interfaces"
import { FaTrashAlt, FaPlus, FaMinus } from 'react-icons/fa'


const numberFormat = (num:number):string => {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD'
  }).format(num)
}


interface IProps {
  product: IProduct<ICategory>
}


const CartItem:NextPage<IProps> = ({ product }) => {
  const { _id, images, title, category, price, quantity, inStock } = product
  const { cart, dispatch } = useContext(DataContext)

  return (
    <tr>
      <td>
        <img 
          className="img-thumbnail rounded"
          src={images[0].url}
          alt={title}
        />
      </td>

      <td>
        <Link href="/product/[id]" as={`/product/${_id}`}>
          <a className="product-link">
            {title}
          </a>
        </Link>
        {' '}
        <kbd className="bg-primary">{category.name}</kbd>

        <h6 className="text-danger my-2">{numberFormat(price * quantity)}</h6>
        <h6 className="text-danger">In Stock: {inStock}</h6>
      </td>


      <td id="operations">
        <div className="d-flex">
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={quantity === 1 ? undefined : () => dispatch(decrease(_id, cart))}
            disabled={quantity === 1 ? true : false }
          >
            <FaMinus />
          </button>

          <h6>{quantity}</h6>

          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={quantity >= inStock ? undefined : () => dispatch(increase(_id, cart))}
            disabled={quantity >= inStock ? true : false}
          >
            <FaPlus />
          </button>
        </div>
      </td>

      <td>
        <button 
          className="btn" 
          id="deleteBtn"
          onClick={() => dispatch(updateModalWindowDeleteProduct({ isShow: true, _id }))}
        >
          <FaTrashAlt className="text-danger" />
        </button>
      </td>
    </tr>
  )
}


export default CartItem