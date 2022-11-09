import { NextPage } from "next"
import { FaChevronCircleDown, FaPencilAlt, FaTrashAlt } from "react-icons/fa"
import React, { Fragment, useContext, useState, useEffect } from "react"
import { DataContext } from '../store/DataContext'
import { hideLoader, showAlert, showLoader, updateModalWindowDeleteCategory, updateModalWindowDeleteProduct } from "../store/actions"
import { deleteData, putData } from "../utils/fetchData"
import { ICategory, IContext } from "../interfaces"
import Modal from './modals/Modal'
import ProductsDatatable from './datatables/Products'



interface IProps {
  _categories: ICategory[]
}


interface IData {
  categories?: ICategory[]
  message?: string
  status?: string
}


// Handle Show
const handleShow = (e:React.MouseEvent<HTMLButtonElement> & { target: Element }):void => {
  const btn = e.target.closest('.btn') as HTMLButtonElement
  btn.classList.toggle('open')
  const collapse = document.querySelector(btn.dataset.id)
  collapse && collapse.classList.toggle('show')
}


const CategoryList:NextPage<IProps> = ({ _categories }) => {
  const { auth, dispatch, dataModalWindowDeleteCategory, dataModalWindowDeleteProduct } = useContext<IContext>(DataContext)
  const [categories, setCategories] = useState<ICategory[]>([])

  useEffect(() => setCategories(_categories), [_categories])


  const handleClose = ():void => {
    dispatch(updateModalWindowDeleteCategory({ isShow: false }))
    dispatch(updateModalWindowDeleteProduct({ isShow: false }))
  }


  const handleDeleteCategory = async ():Promise<void> => {
    handleClose()
    dispatch(showLoader())

    const { categories } = await deleteData<{ categories: ICategory[] }>(`account/categories/${dataModalWindowDeleteCategory._id}`, auth?.token)
    setCategories(categories)

    dispatch(hideLoader())
  }


  const handleDeleteProduct = async ():Promise<void> => {
    handleClose()
    dispatch(showLoader())

    const { categories } = await deleteData<{ categories: ICategory[] }>(`account/products/${dataModalWindowDeleteProduct._id}`, auth?.token)
    setCategories(categories)

    dispatch(hideLoader())
  }

  
  const handleEdit = (e: React.MouseEvent<HTMLButtonElement> & { target: Element }):void => {
    const currentEl = e.target.closest('li').querySelector('#categoryName')
    const form = document.createElement('form')
    const input = document.createElement('input')
    const categoryId = (e.target.closest('.btn') as HTMLButtonElement).dataset.id

    const handleBlur = ():void => form.replaceWith(currentEl)

    input.value = (currentEl as HTMLSpanElement).innerText
    input.classList.add('form-control')
    input.addEventListener('blur', handleBlur)

    form.addEventListener('submit', e => {
      e.preventDefault()

      const data = { name: input.value }
      handleEditCategory(categoryId, data)

      input.blur()
    })

    form.append(input)
    input.required = true
    input.autocomplete = 'off'
    currentEl.replaceWith(form)
    input.focus()
  }


  const handleEditCategory = async (categoryId: string, data):Promise<void> => {
    handleClose()
    dispatch(showLoader())

    const { message, status, categories } = await putData<{ name:string }, IData>(`account/categories/${categoryId}`, data, auth?.token)
    setCategories(categories)

    dispatch(showAlert({ message, status }))
    dispatch(hideLoader())
  }



  return (
    <>
      <Modal
        isShow={dataModalWindowDeleteCategory?.isShow}
        callback={updateModalWindowDeleteCategory({ ...dataModalWindowDeleteCategory, isShow: true })}
        text="All products related to this category will be removed. Do you want to continue?"
        handleClose={handleClose}
        handleDelete={handleDeleteCategory}
      />

      {categories?.length ? categories?.map((category, idx) => {
        return (
          <Fragment key={category._id}>
            <li className="list-group-item text-primary" id="category">
              <div className="category">{idx + 1}. <span id="categoryName">{category.name}</span></div>

              <div className="btn-group">
                <button 
                  data-id={category._id}
                  className="btn btn-sm"
                  onClick={handleEdit}
                >
                  <FaPencilAlt className="text-warning" />
                </button>
                
                <button 
                  className="btn btn-sm"
                  onClick={() => dispatch(updateModalWindowDeleteCategory({ isShow: true,  _id: category._id }))}
                >
                  <FaTrashAlt className="text-danger" />
                </button>

                <button 
                  className="btn" 
                  onClick={handleShow}
                  data-id={`#productList-${category._id}`}
                >
                  <FaChevronCircleDown id="chevronCircleDown" />
                </button>
              </div>
            </li>

            <div id={`productList-${category._id}`} className="collapse">
              { category?.products?.length ? <ProductsDatatable category={category} handleDelete={handleDeleteProduct} /> : '' }
            </div>
          </Fragment>
        )
      }) : <h5 className="noData">No categories</h5>}
    </>
  )
}


export default CategoryList