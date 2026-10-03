import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
	children: React.ReactNode
}

export function Portal({ children }: PortalProps) {
	const [render, setRender] = useState(false)

	useEffect(() => {
		setRender(true)
	}, [])

	return <>{render && createPortal(children, document.body)}</>
}
