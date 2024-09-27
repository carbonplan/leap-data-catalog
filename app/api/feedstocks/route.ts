import { Feedstock } from '@/types/types'
import { NextResponse } from 'next/server'

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
    return NextResponse.json(feedstocks)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch feedstocks' },
      { status: 500 },
    )
  }
}
