import Link from "next/link"
import { NextPage } from "next"
import { useContext } from "react"
import { FaTrashAlt } from 'react-icons/fa'
import { IContext, IOrder } from "../interfaces"
import { updateModalWindowDeleteProduct } from "../store/actions"
import { DataContext } from "../store/DataContext"


interface IProps {
  order: IOrder
}

const dateFormat = (date:string):string => new Date(date).toLocaleString()

const numberFormat = (num:number):string => {
  return new Intl.NumberFormat('en', {
    currency: 'USD',
    style: 'currency'
  }).format(num)
}


const OrderItem:NextPage<IProps> = ({ order }) => {
  const { dispatch } = useContext<IContext>(DataContext)
  const { _id, cart, total, createdAt } = order


  return (
    <div className="card shadow border-0">
      <div className="card-body">
        <button 
          className="btn btn-sm btn-danger" 
          onClick={() => dispatch(updateModalWindowDeleteProduct({ isShow: true,  _id }))}
        >
          <FaTrashAlt />
        </button>

        <h5 className="mb-3">{dateFormat(createdAt)}</h5>
        
        <table className="table table-sm text-center table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {cart?.map(product => {
              return (
                <tr key={product._id}>
                  <td>
                    <img 
                      className="product-image border"
                      src={product?.images[0].url}
                      alt={product?.title}
                    />
                  </td>
                  <td>
                    <Link href={`/orders/${order._id}?productId=${product._id}`} as={`/orders/${order._id}?productId=${product._id}`}>
                      <a className="title">{product?.title}</a>
                    </Link>
                  </td>
                  <td>{product?.quantity}</td>
                  <td>{product?.price}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <h4 className="text-right mt-3 price">
          Price: {' '}
          <span className="text-primary">{numberFormat(total)}</span>
        </h4>
      </div>
    </div>
  )
}


export default OrderItem