import Head from 'next/head'
import { useThemeUI } from 'theme-ui'

export const Meta = ({ title, description, card }) => {
  const { theme, colorMode } = useThemeUI()
  return (
    <Head>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <link
        rel='alternate icon'
        type='image/png'
        href='https://leap.columbia.edu/wp-content/uploads/2021/11/cropped-favicon-1-1-32x32.png'
      />
      <link
        rel='icon'
        type='image/png'
        href='https://leap.columbia.edu/wp-content/uploads/2021/11/cropped-favicon-1-1-32x32.png'
      />
      <meta name='theme-color' content={theme.colors.background} />
      <meta
        name='color-scheme'
        content={colorMode === 'light' ? 'light' : 'dark'}
      />
      <meta name='msapplication-TileColor' content={theme.colors.background} />
      <meta
        name='msapplication-TileImage'
        content='https://leap.columbia.edu/wp-content/uploads/2021/11/cropped-favicon-1-1-180x180.png'
      />

      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={card} />
      <meta property='og:url' content='https://catalog.leap.carbonplan.org/' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={card} />
      <meta name='format-detection' content='telephone=no' />
    </Head>
  )
}
