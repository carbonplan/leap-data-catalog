import { NextResponse } from 'next/server'

const htmlReprServiceUrl = 'https://html-reprs.fly.dev/xarray'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 },
    )
  }

  try {
    const reprUrl = `${htmlReprServiceUrl}?url=${url}`
    const response = await fetch(reprUrl)
    if (!response.ok) {
      // Instead of throwing a generic error, we'll create a more detailed error object
      const errorData = await response.text()
      throw new Error(
        `Failed to fetch dataset: ${response.status} ${response.statusText}\n${errorData}`,
      )
    }
    const dataset = await response.json()

    // Return the fetched dataset
    return NextResponse.json(dataset, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Error fetching dataset:', error)

    // Propagate the error message
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred'

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
