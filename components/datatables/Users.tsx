import Link from 'next/link'
import { NextPage } from 'next'
import { FaCheck, FaTimes, FaEdit, FaTrashAlt } from 'react-icons/fa'
import { useContext, useState, useEffect, useMemo } from 'react'
import { IContext, IUser } from '../../interfaces'
import { hideLoader, showLoader, updateModalWindowDeleteAccount } from '../../store/actions'
import { DataContext } from '../../store/DataContext'
import { deleteData } from '../../utils/fetchData'
import Modal from '../modals/Modal'


interface IProps {
  _users: IUser[]
}


const Users:NextPage<IProps> = ({ _users }) => {
  const { auth, dispatch, dataModalWindowDeleteAccount } = useContext<IContext>(DataContext)
  const [users, setUsers] = useState<IUser[]>([])

  const isDisabled = useMemo(():string => auth?.user?.role !== 'admin' ? 'isDisabled' : '', [auth])

  useEffect(():void => setUsers(_users), [_users])

  const handleClose = ():void => dispatch(updateModalWindowDeleteAccount({ isShow: false }))

  const handleDeleteAccount = async ():Promise<void> => {
    dispatch(showLoader())
    handleClose()

    const { users } = await deleteData<{ users: IUser[] }>(`users/${dataModalWindowDeleteAccount?.userId}`, auth?.token)
    setUsers(users)

    dispatch(hideLoader())
  }


  return (
    <div className="data">
      <Modal 
        isShow={dataModalWindowDeleteAccount?.isShow}
        callback={updateModalWindowDeleteAccount({ ...dataModalWindowDeleteAccount, isShow: true })}
        text='Do you want to delete this account permanently?'
        handleClose={handleClose}
        handleDelete={handleDeleteAccount}
      />

      <table className="table table-hover table-striped shadow">
        <thead className="table-dark bg-dark">
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>Avatar</th>
            <th>Name</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Root</th>
            <th>Operations</th>
          </tr>
        </thead>

        <tbody>
          {users?.map((user, idx) => {
            return (
              <tr key={user._id}>
                <td>{idx + 1}</td>
                <td>{user._id}</td>
                <td>
                  <img 
                  src={user.avatar}
                  className="user-avatar"
                  alt={user.name}
                  />   
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>

                <td>
                  {
                    user.role === 'admin' 
                      ? <FaCheck className="text-success" />
                      : <FaTimes className="text-danger" />
                  }
                </td>

                <td>
                  {
                    user.root
                      ? <FaCheck className="text-success" />
                      : <FaTimes className="text-danger" />
                  }
                </td>

                <td>
                  {!user?.root && (
                    <>
                      <Link 
                        href={
                          auth?.user?.role === 'admin' 
                            ? `/edit-user/[userId]`
                            : '#!'
                        }
    
                        as={
                          auth?.user?.role === 'admin' 
                            ? `/edit-user/${user?._id}`
                            : '#!'
                        }
                      >
                        <a
                          className={isDisabled}
                        >
                          <FaEdit className="text-info mr-2" />
                        </a>
                      </Link>
  
                      <a 
                        style={{ cursor: 'pointer' }}
                        onClick={
                          auth?.user?.role === 'admin' 
                            ? () => dispatch(updateModalWindowDeleteAccount({ isShow: true, userId: user?._id }))
                            : undefined
                        }
                        className={isDisabled}
                      >
                        <FaTrashAlt className="text-danger ml-2" />
                      </a>
                    </>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}


export default Users