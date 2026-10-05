import { StoreIcon } from 'lucide-react'
import Link from 'next/link'

import { ThemeToggler } from '@/components/theme-toggler'

export function Navbar() {
	return (
		<nav className="flex items-center justify-between gap-4 py-4 px-4 md:px-6 border-b">
			<div>
				<Link href="/lists" className="font-bold flex items-center gap-2">
					<StoreIcon className="size-4.5 stroke-3" />
					<h1 className="text-lg font-bold leading-none">
						GROCERE<span className="inline-block rotate-y-180">E</span>SE
					</h1>
				</Link>
			</div>
			<ThemeToggler />
		</nav>
	)
}
