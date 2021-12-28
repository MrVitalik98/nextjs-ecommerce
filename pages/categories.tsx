import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useState, useEffect, useContext } from 'react'
import { DataContext } from '../store/DataContext'
import { hideLoader, showAlert, showLoader } from '../store/actions'
import { getData, postData } from '../utils/fetchData'
import { ICategory, IContext } from '../interfaces'
import CategoryList from '../components/CategoryList'


interface IData {
  categories: ICategory[]
  message?: string
  status?: string
}


const Categories:NextPage = () => {
  const [name, setName] = useState<string>('')
  const [categories, setCategories] = useState<ICategory[]>([])
  const { auth, loading, dispatch } = useContext<IContext>(DataContext)
  const router = useRouter()

  
  useEffect(() => {
    auth?.user?.role !== 'admin' && router.push('/')
  }, [auth?.user?.role])


  const fetchCategories = async (): Promise<void> => {
    dispatch(showLoader())

    const { categories } = await getData<IData>('account/categories', auth?.token)
    setCategories(categories)
    
    dispatch(hideLoader())
  }


  useEffect(() => {
    fetchCategories()
  }, [])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value)
  }


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    dispatch(showLoader())

    const data = await postData<{ name:string }, IData>('account/categories', { name }, auth?.token)
    setName('')
    setCategories(data?.categories)

    dispatch(showAlert({ message: data?.message, status: data?.status }))
    dispatch(hideLoader())
  }



  return (
    <>
      <Head>
        <title>Categories</title>
      </Head>
      
      <div className="categories">
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            className="form-control"
            value={name}
            onChange={handleChange}
            placeholder="Category Name"
            disabled={loading}
            required
          />

          <button 
            type="submit" 
            className="btn btn-success"
            disabled={loading}
          >
            Add
          </button>
        </form>

        <ul className="list-group shadow">
          <CategoryList _categories={categories} /> 
        </ul>
      </div>
    </>
  )
}


export default Categories