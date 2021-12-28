import { NextPage } from 'next'
import { useContext } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { DataContext } from '../../store/DataContext'
import { FaExclamationTriangle } from 'react-icons/fa'


interface IModalProps {
  title? : string
  text?: string
  isShow: boolean
  callback: React.ReactNode
  handleClose: () => void
  handleDelete: () => void
}


const ModalWindow:NextPage<IModalProps> = ({ callback, title, text, handleClose, handleDelete, isShow }) => {
  const { dispatch } = useContext(DataContext)

  return (
    <Modal 
      show={isShow} 
      onHide={() => dispatch(callback)}
    >
      <Modal.Header>
        <FaExclamationTriangle className="text-warning" />
      </Modal.Header>
      <Modal.Body>
        {title && <h5 className="title">{title}</h5>}
        <p className="message">{text}</p>

      <div className="btn-group">

        <Button 
          variant="info" 
          onClick={handleClose}
        >
          Cancel
        </Button>

        <Button 
          variant="danger" 
          onClick={handleDelete}
        >
          Delete
        </Button>

      </div>
      </Modal.Body>
    </Modal>
  )
}


export default ModalWindow