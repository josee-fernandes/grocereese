import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'

import { Toaster } from '@/components/ui/sonner'

import '@/styles/global.css'

function App({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<Toaster
				expand
				richColors
				closeButton
				toastOptions={{
					duration: 3000,
					classNames: {
						closeButton: 'right-0 left-[initial] translate-x-[35%] -translate-y-[35%]',
					},
				}}
			/>
			<Component {...pageProps} />
		</ThemeProvider>
	)
}

export default App
