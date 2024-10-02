import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { FC } from 'react'

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Toaster
        expand
        richColors
        closeButton
        toastOptions={{
          duration: 3000,
          classNames: {
            closeButton:
              'right-0 left-[initial] translate-x-[35%] -translate-y-[35%]',
          },
        }}
      />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

App.displayName = 'App'

export default App
