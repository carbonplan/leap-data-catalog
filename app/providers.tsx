'use client'
// This component contains Third-party Packages and Providers with an explicit 'use client' directive
// See Next.js docs for more:
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#using-third-party-packages-and-providers

import { theme } from '@/styles/theme'
import { ThemeUIProvider } from 'theme-ui'
const Providers = ({ children }: { children: React.ReactNode }) => {
  return <ThemeUIProvider theme={theme}>{children}</ThemeUIProvider>
}

export default Providers
