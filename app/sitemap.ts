import { getFeedstocks } from '@/utils/get-feedstocks'
import { SITE } from '@/utils/json-ld'
import { MetadataRoute } from 'next'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const feedstocks = await getFeedstocks()
  return [
    { url: SITE },
    ...feedstocks.map((f) => ({ url: `${SITE}/feedstock/${f.slug}` })),
  ]
}
