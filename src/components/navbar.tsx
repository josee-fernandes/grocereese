import { ShoppingCart, StoreIcon } from 'lucide-react'

import { ThemeToggler } from './theme-toggler'

export const Navbar: React.FC = () => {
	return (
		<nav className="flex items-center justify-between gap-4 py-4 px-4 md:px-6 border-b">
			<div className="font-bold flex items-center gap-2">
				<StoreIcon className="size-4" />
				<span className="text-lg font-bold leading-none">GROCEREESE</span>
			</div>
			<ThemeToggler />
		</nav>
	)
}
