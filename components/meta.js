import Head from 'next/head'
import { useThemeUI } from 'theme-ui'

export const Meta = ({ title, description, card }) => {
  const { theme, colorMode } = useThemeUI()
  return (
    <Head>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <link rel='alternate icon' type='image/png' href='' />
      <meta name='theme-color' content={theme.colors.background} />
      <meta
        name='color-scheme'
        content={colorMode === 'light' ? 'light' : 'dark'}
      />
      <meta name='msapplication-TileColor' content={theme.colors.background} />

      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={card} />
      <meta property='og:url' content='https://leap-data-catalog.vercel.app/' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={card} />
      <meta name='format-detection' content='telephone=no' />
    </Head>
  )
}
