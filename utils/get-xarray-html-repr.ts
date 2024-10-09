const htmlReprServiceUrl = 'https://html-reprs.fly.dev/xarray'

export async function getDatasetRepr(url: string) {
  if (!url) {
    throw new Error('URL parameter is required')
  }

  try {
    const reprUrl = `${htmlReprServiceUrl}?url=${url}`

    const response = await fetch(reprUrl, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(
        `Failed to fetch dataset: ${response.status} ${response.statusText}\n${errorData}`,
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching dataset:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred'
    throw new Error(errorMessage)
  }
}
