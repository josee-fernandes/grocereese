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
				}}
			/>
			<Component {...pageProps} />
		</ThemeProvider>
	)
}

export default App
