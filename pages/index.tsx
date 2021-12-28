import Head from "next/head"
import { NextPage } from 'next'
import React, { useContext, useEffect, useState, useMemo } from 'react'
import { getData, deleteData, patchData } from '../utils/fetchData'
import { DataContext } from '../store/DataContext'
import { updateModalWindowDeleteProduct, updateModalWindowDeleteProducts, showLoader, hideLoader, showAlert } from '../store/actions'
import ProductItem from '../components/ProductItem'
import Modal from '../components/modals/Modal'
import { IContext, IProduct, ICategory } from "../interfaces"


export interface IProps {
  products: IProduct<ICategory>[]
  categories: ICategory[]
}

export interface ICheckedProduct {
  _id:string
  category:string 
}


export const getServerSideProps = async ():Promise<{ props: IProps }> => {
  const { products, categories } = await getData<IProps>('products')

  return {
    props: { 
      products, 
      categories
    }
  }
}


const Home:NextPage<IProps> = ({ products: _products, categories: _categories }) => {
  const { auth, dispatch, dataModalWindowDeleteProduct, dataModalWindowDeleteProducts } = useContext<IContext>(DataContext)
  const [categories, setCategories] = useState<ICategory[]>([])
  const [allProducts, setAllProducts] = useState<IProduct<ICategory>[]>([])
  const [category, setCategory] = useState<string>('all')
  const [products, setProducts] = useState<IProduct<ICategory>[]>([])
  const [searchResult, setSearchResult] = useState<IProduct<ICategory>[]>([])
  const [text, setText] = useState<string>('')
  

  const isCheckedAllProducts = useMemo(():boolean => {
    return searchResult?.length && searchResult?.every(product => product.checked)
  }, [searchResult])


  const count = useMemo(():number => {
    const checkedProducts:IProduct<ICategory>[] = searchResult?.filter(product => product.checked)
    return checkedProducts?.length
  }, [searchResult])


  useEffect(():void => {
    dispatch(showLoader())

    setCategories(_categories)
    setAllProducts(_products)
    setProducts(_products)
    setSearchResult(_products)
    
    dispatch(hideLoader())
  }, [_products, _categories])


  useEffect(():void => {
    if(category === 'all') {
      setProducts(allProducts)
      setSearchResult(allProducts)
    }
    else {
      const categoryProducts:IProduct<ICategory>[] = allProducts.filter(product => product.category.name === category)
      setProducts(categoryProducts)
      setSearchResult(categoryProducts)
    }
  }, [category, allProducts])


  useEffect(():void => {
    const result:IProduct<ICategory>[] = products.filter(product => product.title.toLowerCase().trim().includes(text.trim().toLowerCase()))
    setSearchResult(result)
  }, [text])


  const handleChangeCategory = (e: React.ChangeEvent<HTMLSelectElement>):void => setCategory(e.target.value)

  const handleClose = () => {
    dispatch(updateModalWindowDeleteProduct({ isShow: false }))
    dispatch(updateModalWindowDeleteProducts({ isShow: false }))
  }
  

  const handleDeleteProduct = async () => {
    handleClose()
    dispatch(showLoader())

    const { products } = await deleteData<{ products: IProduct<ICategory>[]}>(`products/${dataModalWindowDeleteProduct._id}`, auth?.token)
    setProducts(products)
    setAllProducts(products)
    setSearchResult(products)

    dispatch(hideLoader())
  }


  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const productId:string = e.target.closest('.card').id
    const mapProducts:IProduct<ICategory>[] = searchResult.map(product => product._id === productId ? ({ ...product, checked: e.target.checked }) : product)
    setSearchResult(mapProducts)
  }


  const handleCheckAllProducts = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { checked } = e.target
    const mapProducts:IProduct<ICategory>[] = searchResult.map(product => ({
      ...product,
      checked
    }))

    setSearchResult(mapProducts)
  }


  const handleDeleteProducts = async (): Promise<void> => {
    handleClose()
    dispatch(showLoader())

    const checkedProducts:ICheckedProduct[] = searchResult?.filter(product => product.checked)
                                                           .map(({ _id, category }) => ({ _id, category: category?._id }))

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
        <title>Home</title>
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
                  <option 
                    key={category._id} 
                    value={category?.name}
                  >
                    {category?.name}
                  </option>
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
          {auth?.user?.role === 'admin' ? (
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
          ) : <div></div>}

          

          <h5 className="text-right">
            <span className="text-success">Result: {searchResult?.length || 0}</span>
            <span className="text-primary ml-3">Total: {products?.length || 0}</span>
          </h5>
        </div>
      </div>
      

      <div className="products">
        {searchResult?.length ? searchResult?.map(product => {
          return (
            <ProductItem 
              key={product._id} 
              product={product} 
              handleCheck={handleCheck}
            />
          )
        }) : <h5 className="noData">No products</h5>}
      </div>
    </>
  )
}


export default Home