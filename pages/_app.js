import { theme } from '@/styles/theme'
import { ThemeProvider } from 'theme-ui'

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
