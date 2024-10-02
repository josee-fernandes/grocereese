import { ThemeToggler } from '@/components/theme-toggler'
import { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div>
      <ThemeToggler />
    </div>
  )
}

Home.displayName = 'Home'

export default Home
