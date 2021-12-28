import Link from 'next/link'
import { NextPage } from 'next'
import { useContext } from 'react'
import { FaTimesCircle, FaPencilAlt } from 'react-icons/fa'
import { ICategory, IContext } from '../../interfaces'
import { updateModalWindowDeleteProduct } from '../../store/actions'
import { DataContext } from '../../store/DataContext'
import Modal from '../modals/Modal'


interface IProps {
  category: ICategory
  handleDelete: () => void
}


// Number Format
const numberFormat = (num:number):string => {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD'
  }).format(num)
}


const Products:NextPage<IProps> = ({ category, handleDelete }) => {
  const { dispatch, dataModalWindowDeleteProduct } = useContext<IContext>(DataContext)

  const handleClose = ():void => dispatch(updateModalWindowDeleteProduct({ isShow: false }))


  return (
    <>
      <Modal
        isShow={dataModalWindowDeleteProduct?.isShow}
        callback={updateModalWindowDeleteProduct({ ...dataModalWindowDeleteProduct, isShow: true })}
        text="Do you want delete this product?"
        handleClose={handleClose}
        handleDelete={handleDelete}
      />

      <table className="table table-sm table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>In Stock</th>
            <th>Sold</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {category?.products?.map((product, idx) => {
            return (
              <tr key={product._id}>
                <td>{idx + 1}</td>
                <td>
                  <Link href={`/product/${product._id}`}>
                    <a>{product.title}</a>
                  </Link>
                </td>
                <td>{product.inStock}</td>
                <td>{product.sold}</td>
                <td>{numberFormat(product.price)}</td>
                <td id="operations">
                  <div className="btn-group">
                    <Link 
                      href="/product/edit/[productId]"
                      as={`/product/edit/${product._id}`}
                    >
                      <a className="btn" id="edit">
                        <FaPencilAlt className="text-warning" />
                      </a>
                    </Link>
                    

                    <button 
                      id="delete"
                      className="btn p-0"
                      onClick={() => dispatch(updateModalWindowDeleteProduct({ isShow: true,  _id: product._id }))}
                    >
                      <FaTimesCircle />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}


export default Products