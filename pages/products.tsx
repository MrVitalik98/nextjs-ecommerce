import Link from 'next/link'
import Head from 'next/head'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FaPlusCircle } from 'react-icons/fa'
import React, { useContext, useState, useEffect, useMemo } from 'react'
import { hideLoader, showLoader, updateModalWindowDeleteProduct, updateModalWindowDeleteProducts, showAlert } from '../store/actions'
import { DataContext } from '../store/DataContext'
import { deleteData, getData, patchData } from '../utils/fetchData'
import { ICategory, IContext, IProduct } from '../interfaces'
import { ICheckedProduct, IProps } from '.'
import ProductItem from '../components/ProductItem'
import Modal from '../components/modals/Modal'


const MyProducts:NextPage = () => {
  const { auth, dispatch, dataModalWindowDeleteProduct, dataModalWindowDeleteProducts } = useContext<IContext>(DataContext)
  const [categories, setCategories] = useState<ICategory[]>([])
  const [allProducts, setAllProducts] = useState<IProduct<ICategory>[]>([])
  const [category, setCategory] = useState<string>('all')
  const [products, setProducts] = useState<IProduct<ICategory>[]>([])
  const [searchResult, setSearchResult] = useState<IProduct<ICategory>[]>([])
  const [text, setText] = useState<string>('')
  const router = useRouter()


  const isCheckedAllProducts = useMemo(():boolean => {
    return searchResult?.length && searchResult?.every(product => product.checked)
  }, [searchResult])


  const count = useMemo(():number => {
    const checkedProducts = searchResult?.filter(product => product.checked)
    return checkedProducts?.length
  }, [searchResult])
  

  useEffect(():void => {
    auth?.user?.role !== 'admin' && router.push('/')
  }, [auth?.user?.role])


  useEffect(():void => {
    fetchData()
  }, [])

  const fetchData = async (): Promise<void> => {
    dispatch(showLoader())

    const { categories, products } = await getData<IProps>('account/products', auth?.token)
    setCategories(categories)
    setAllProducts(products)
    setProducts(products)
    setSearchResult(products)
    
    dispatch(hideLoader())
  }


  useEffect(():void => {
    if(category === 'all') {
      setProducts(allProducts)
      setSearchResult(allProducts)
    }else {
      const categoryProducts: IProduct<ICategory>[] = allProducts.filter(product => product.category.name === category)
      setProducts(categoryProducts)
      setSearchResult(categoryProducts)
    }
  }, [category, allProducts])


  useEffect(():void => {
    const result:IProduct<ICategory>[] = products.filter(product => product.title.toLowerCase().trim().includes(text.trim().toLowerCase()))
    setSearchResult(result)
  }, [text])


  const handleChangeCategory = (e: React.ChangeEvent<HTMLSelectElement>): void => setCategory(e.target.value)

  const handleClose = ():void=> {
    dispatch(updateModalWindowDeleteProduct({ isShow: false }))
    dispatch(updateModalWindowDeleteProducts({ isShow: false }))
  }

  const handleDeleteProduct = async (): Promise<void> => {
    handleClose()
    dispatch(showLoader())

    const { products } = await deleteData<{ products: IProduct<ICategory>[] }>(`products/${dataModalWindowDeleteProduct._id}`, auth?.token)
    setProducts(products)
    setAllProducts(products)
    setSearchResult(products)

    dispatch(hideLoader())
  }


  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>):void => {
    const productId:string = e.target.closest('.card').id
    const mapProducts: IProduct<ICategory>[] = searchResult.map(product => product._id === productId ? ({ ...product, checked: e.target.checked }) : product)

    setSearchResult(mapProducts)
  }


  const handleCheckAllProducts = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { checked } = e.target
    const mapProducts: IProduct<ICategory>[] = searchResult.map(product => ({
      ...product,
      checked
    }))

    setSearchResult(mapProducts)
  }


  const handleDeleteProducts = async (): Promise<void> => {
    handleClose()
    dispatch(showLoader())

    const checkedProducts: ICheckedProduct[] = searchResult?.filter(product => product.checked)
                                        .map(({ _id, category }) => ({ _id, category: category._id }))

    const { products } = await patchData<ICheckedProduct[], { products: IProduct<ICategory>[] }>('products', checkedProducts, auth?.token)
    setAllProducts(products)
    setProducts(products)
    setSearchResult(products)

    dispatch(hideLoader())
  }


  const handleOpenModalDeleteProducts = (): void => {
    const selectedProducts: IProduct<ICategory>[] = searchResult?.filter(product => product.checked)
    if(!selectedProducts?.length) return dispatch(showAlert({ message: 'Please select the products you want to remove', status: 'error' }))

    dispatch(updateModalWindowDeleteProducts({ isShow: true })) 
  }



  return (
    <>
      <Head>
        <title>My Products</title>
      </Head>

      <Modal 
        isShow={dataModalWindowDeleteProduct?.isShow}
        text="Do you want delete this product?"
        callback={updateModalWindowDeleteProduct({ ...dataModalWindowDeleteProduct, isShow: true })}
        handleClose={handleClose}
        handleDelete={handleDeleteProduct}
      />

      <Modal 
        isShow={dataModalWindowDeleteProducts?.isShow}
        title={`Selected products - ${count}`}
        text='Do you want delete selected product(s)?'
        callback={updateModalWindowDeleteProducts({ ...dataModalWindowDeleteProducts, isShow: true })}
        handleClose={handleClose}
        handleDelete={handleDeleteProducts}
      />

      <div className="input__box">
        <div className="btn-group">
          <Link href="/categories">
            <a className="btn btn-primary">
              <FaPlusCircle />
              <span>Category</span>
            </a>
          </Link>            

          <Link href="/product/create">
            <a className="btn btn-success">
              <FaPlusCircle />
              <span>Product</span>
            </a>
          </Link>
        </div>

        <div className="input-group">
          <div className="input-group-prepend">
            <select 
              className="form-control mr-1 custom-select" 
              value={category || 'all'} 
              onChange={handleChangeCategory}
            >
              <option value="all">All</option>

              {categories?.length && categories?.map(category => {
                return (
                  <option key={category._id} value={category?.name}>{category?.name}</option>
                )
              })}
            </select>
          </div>
          
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search"
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>

        <div className="d-flex flex-wrap justify-content-between">
          <div className="btn-group">
            <button 
              id="checkAll"
              className="btn btn-info"
              disabled={!searchResult?.length}
            >
              <input 
                type="checkbox"
                className="form-control"
                checked={isCheckedAllProducts}
                onChange={searchResult?.length ? handleCheckAllProducts : undefined}
                disabled={!searchResult?.length}
              />
              Check All
            </button>
          
            <button 
              className="btn btn-danger"
              onClick={searchResult?.length && count ? handleOpenModalDeleteProducts : undefined}
              disabled={!searchResult?.length || !count}
            >
              Delete
            </button>
          </div>
          

          <h5 className="text-right">
            <span className="text-success">Result: {searchResult?.length || 0}</span>
            <span className="text-primary ml-3">Total: {products?.length || 0}</span>
          </h5>
        </div>
      </div>

      <div className={`products ${searchResult?.length ? '' : "empty"}`}>
        {searchResult?.length ? searchResult?.map(product => {
          return (
            <ProductItem 
              key={product._id} 
              product={product} 
              handleCheck={handleCheck}
            />
          )
        }) : <h5 className="text-danger noData">No Products</h5>}
      </div>
    </>
  )
}


export default MyProducts