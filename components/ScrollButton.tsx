import { useState } from 'react'
import { NextPage } from 'next'
import { FaArrowCircleUp } from 'react-icons/fa'
import { animateScroll as scroll } from 'react-scroll'


const ScrollButton:NextPage = () => {
  const [visible, setVisible] = useState<boolean>(false)

  const scrollToTop = ():void => {
    scroll.scrollTo(0, { smooth: true })
  }

  const toggleVisible = ():void => {
    window.pageYOffset > window.innerHeight ? setVisible(true) : setVisible(false)
  }

  if (typeof window !== "undefined") {
    window.addEventListener('scroll', toggleVisible)
  }


  return (
    <button
      id="scrollButton"
      className={`btn btn-light shadow ${visible ? 'visible' : 'invisible'}`}
      onClick={scrollToTop}
      disabled={!visible}
    >
      <FaArrowCircleUp className="text-dark" />
    </button>
  )
}


export default ScrollButton
