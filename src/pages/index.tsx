import { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const Home: NextPage = () => {
	const router = useRouter()

	useEffect(() => {
		router.push('/lists')
	}, [router])

	return <></>
}

export default Home
