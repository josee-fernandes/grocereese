import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children: React.ReactNode
}

export const Portal: React.FC<PortalProps> = ({ children }) => {
  const [render, setRender] = useState(false)

  useEffect(() => {
    setRender(true)
  }, [])

  return <>{render && createPortal(children, document.body)}</>
}

Portal.displayName = 'Portal'
