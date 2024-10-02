import { ThemeProvider } from '@/components/theme-provider'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { FC } from 'react'

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

App.displayName = 'App'

export default App
