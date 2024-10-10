import { ShoppingCart } from 'lucide-react'
import { ThemeToggler } from './theme-toggler'

export const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between gap-4 py-4 px-6 border-b">
      <div className="font-bold flex items-center gap-2">
        <ShoppingCart className="size-4" />
        <span className="text-lg font-bold leading-none">Grocereese</span>
      </div>
      <ThemeToggler />
    </nav>
  )
}

Navbar.displayName = 'Navbar'
