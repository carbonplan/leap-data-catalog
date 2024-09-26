interface FetchError extends Error {
  info?: any
  status?: number
}

export async function fetcher(url: string): Promise<any> {
  const response = await fetch(url)

  if (!response.ok) {
    const error: FetchError = new Error(
      `An error occurred while fetching data from URL: ${url}`,
    )
    error.info = await response.json()
    error.status = response.status
    throw error
  }

  const data = await response.json()
  return data
}
