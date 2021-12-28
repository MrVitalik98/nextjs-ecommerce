import Link from 'next/link'
import { NextPage } from 'next'
import Cookies from 'js-cookie'
import { useContext } from 'react'
import { useRouter } from 'next/router'
import { DataContext } from '../store/DataContext'
import { authUser } from '../store/actions'
import { IContext } from '../interfaces'
import { 
  FaShoppingCart, FaUser, FaClipboardList, 
  FaThList, FaListAlt, FaUsers, FaSignOutAlt 
} from 'react-icons/fa'


const Navbar:NextPage = () => {
  const router = useRouter()
  const isActive = (url:string):string => url === router.pathname ? 'active' : ''
  const { auth, dispatch, cart } = useContext<IContext>(DataContext)


  const handleLogout = ():void => {
    Cookies.remove('refresh_token', { path: 'api/auth/accessToken' })
    localStorage.removeItem('token_data')
    dispatch(authUser({}))
  }


  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
      <Link href="/">
        <a className="navbar-brand">E-Commerce</a>
      </Link>
      
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse justify-content-end" id="navbarNavDropdown">
        <ul className="navbar-nav align-items-md-center pr-2">

          <li className={`nav-item ${isActive('/cart')}`}>
            <Link href="/cart">
              <a className="nav-link position-relative">
                <span className="badge badge-pill bg-danger" id="quantity">{cart.length}</span>
                <FaShoppingCart />
                <span>Cart</span>
              </a>
            </Link>
          </li>

          {auth?.token ? (
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <img
                  className="rounded-circle bg-light"
                  src={auth?.user?.avatar}        
                  style={{ width: '30px', height: '30px' }}
                  alt="avatar"
                /> {' '}
                {auth?.user?.name}
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                <Link href="/account">
                  <a className="dropdown-item">
                    <FaUser /> 
                    <span>My Account</span>
                  </a>
                </Link>

                <Link href="/orders">
                  <a className="dropdown-item">
                    <FaClipboardList /> 
                    <span>Orders</span>
                  </a>
                </Link>

                {auth?.user?.role === 'admin' && (
                  <>
                    <Link href="/categories">
                      <a className="dropdown-item">
                        <FaThList /> 
                        <span>Categories</span>
                      </a>
                    </Link>

                    <Link href="/products">
                      <a className="dropdown-item">
                        <FaListAlt /> 
                        <span>Products</span>
                      </a>
                    </Link>
                  </>
                )}
                  
                {auth?.user?.root && (
                  <Link href="/users">
                    <a className="dropdown-item">
                      <FaUsers /> 
                      <span>Users</span>
                    </a>
                  </Link>
                )}
                
                <hr />

                <button className="dropdown-item" onClick={handleLogout}>
                  <FaSignOutAlt /> 
                  <span>Logout</span>
                </button>
              </div>
            </li>
          ) : (
            <li className={`nav-item ${isActive('/signin')}`}>
              <Link href="/signin">
                <a className="nav-link">
                  <FaUser />
                  <span>Sign In</span>
                </a>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
