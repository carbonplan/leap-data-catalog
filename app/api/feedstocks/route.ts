import { Feedstock } from '@/types/types'
import { NextResponse } from 'next/server'
import { slugify } from '@/utils/slugify'

const defaultCatalogUrl =
  'https://raw.githubusercontent.com/leap-stc/data-management/main/catalog/output/consolidated-web-catalog.json'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const catalogUrl = searchParams.get('catalog') || defaultCatalogUrl

  try {
    const response = await fetch(catalogUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch feedstocks')
    }
    const feedstocks: Feedstock[] = await response.json()

    // Add slug to each feedstock
    const feedstocksWithSlugs = feedstocks.map((feedstock) => ({
      ...feedstock,
      slug: slugify(feedstock.title),
    }))
    return NextResponse.json(feedstocksWithSlugs, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch feedstocks' },
      { status: 500 },
    )
  }
}
