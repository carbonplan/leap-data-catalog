import { SITE } from '@/utils/json-ld'
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*' }, sitemap: `${SITE}/sitemap.xml` }
}
