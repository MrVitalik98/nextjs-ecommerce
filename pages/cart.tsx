import Head from 'next/head'
import { NextPage } from 'next'
import { useContext, useEffect } from 'react'
import { DataContext } from '../store/DataContext'
import { ACTIONS } from '../store/types'
import { getData } from '../utils/fetchData'
import { deleteInCart, updateModalWindowDeleteProduct } from '../store/actions'
import { IContext, IProduct, ICategory } from '../interfaces'
import StripeContainer from '../stripe/StripeContainer'
import CartItem from '../components/CartItem'
import Modal from '../components/modals/Modal'



const Cart:NextPage = () => {
  const { cart, dispatch, dataModalWindowDeleteProduct } = useContext<IContext>(DataContext)
  
  const fetchProducts = async (): Promise<void> => {
    const data: { cart: IProduct<ICategory>[] } = JSON.parse(localStorage.getItem('_next_app_cart_'))
    let newCart: IProduct<ICategory>[] = data?.cart || []

    if(data?.cart?.length) {
      newCart = await Promise.all(
        data.cart
          .map(async p => {
            const data = await getData<{ product: IProduct<ICategory> }>(`products/${p._id}`)
            const inStock = data && data?.product?.inStock || 0

            return ({
              ...data?.product,
              quantity: p.quantity > inStock ? 1 : p.quantity
            })
          })
      )
      
      newCart = newCart.filter(p => p.inStock)
    }

    localStorage.setItem('_next_app_cart_', JSON.stringify({ cart: newCart }))
    dispatch({ type: ACTIONS.UPDATE_CART, payload: newCart })
  }

  useEffect(() => { 
    fetchProducts ()
  }, [])


  const handleClose = ():void => dispatch(updateModalWindowDeleteProduct({ isShow: false }))
  
  const handleDelete = (): void => {
    dispatch(deleteInCart(dataModalWindowDeleteProduct?._id, cart))
    handleClose()
  }


  
  return (
    <>
      <Head>
        <title>Cart</title>
      </Head>

      {cart?.length ? (
        <>
          <Modal
            isShow={dataModalWindowDeleteProduct?.isShow}
            callback={updateModalWindowDeleteProduct({ ...dataModalWindowDeleteProduct, isShow: true })}
            text='Do you want delete this product from cart?'
            handleClose={handleClose}
            handleDelete={handleDelete}
          />


          <div className="row justify-content-between my-4 cart">
            <div className="col-md-8 col-12">
              <h2 className="text-uppercase">Shopping Cart</h2>

              <table className="table text-center ">
                <tbody>
                  {cart.map(product => {
                    return (
                      <CartItem key={product._id} product={product} />
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="col-12 col-md-4">
              <StripeContainer />
            </div>
          </div>
        </>
      ) : <img 
            className="cart-img w-100 mx-auto d-block mt-5"
            src="/images/cart.png"
            alt="cart"
          />}
    </>
  )
}


export default Cart