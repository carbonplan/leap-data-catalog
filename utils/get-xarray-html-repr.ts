import { XarrayOpenKwargsType } from '@/types/types'

export async function getDatasetRepr(
  url: string,
  xarrayOpenKwargs: XarrayOpenKwargsType,
) {
  const htmlReprUrl = new URL('https://html-reprs.fly.dev/xarray/')
  htmlReprUrl.searchParams.append('url', url)
  htmlReprUrl.searchParams.append(
    'xarray_open_kwargs',
    JSON.stringify(xarrayOpenKwargs),
  )

  const response = await fetch(htmlReprUrl.toString(), {
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}
