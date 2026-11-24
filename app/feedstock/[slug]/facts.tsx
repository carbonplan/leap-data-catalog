/** @jsxImportSource theme-ui */
import { FeedstockDetail, Link, Store } from '@/types/types'
import { coverage, frequency, resolution, timeRange } from '@/utils/listing'
import { ReactNode } from 'react'

export const ExternalLink = ({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) => (
  <a
    href={href}
    target='_blank'
    rel='noopener noreferrer'
    sx={{ color: 'text', ':hover': { color: 'secondary' } }}
  >
    {children}
  </a>
)

export const licenseOf = ({ provenance }: FeedstockDetail) => {
  const { license, license_link: link } = provenance
  if (!link?.url) return license || 'Not stated'
  return <ExternalLink href={link.url}>{license || link.title}</ExternalLink>
}

const lines = (nodes: ReactNode[]) =>
  nodes.length > 0 &&
  nodes.map((node, i) => (
    <span key={i} sx={{ display: 'block' }}>
      {node}
    </span>
  ))

const linkOf = ({ label, url }: Partial<Link> & { label: string }) =>
  url ? <ExternalLink href={url}>{label}</ExternalLink> : label

const formatsOf = (stores: Store[]) => [
  ...new Set(stores.map((s) => `${s.virtual ? 'virtual ' : ''}${s.format}`)),
]

export const Facts = ({ feedstock }: { feedstock: FeedstockDetail }) => {
  const { provenance, maintainers, source, docs } = feedstock
  const facts: [string, ReactNode][] = [
    ['Coverage', coverage(feedstock)],
    ['Resolution', resolution(feedstock)],
    ['Frequency', frequency(feedstock)],
    ['Time range', timeRange(feedstock)],
    ['Format', formatsOf(feedstock.stores).join(', ')],
    ['Version', feedstock.version],
    ['License', licenseOf(feedstock)],
    [
      'Providers',
      lines(
        provenance.providers.map((p) => linkOf({ label: p.name, url: p.url })),
      ),
    ],
    [
      'Maintainers',
      lines(
        maintainers.map((m) =>
          linkOf({
            label: m.name,
            url: m.github && `https://github.com/${m.github}`,
          }),
        ),
      ),
    ],
    ['Source', source && linkOf(source)],
    ['Docs', lines(docs.map(linkOf))],
    [
      'Catalog',
      <ExternalLink
        key='stac-map'
        href={`https://developmentseed.org/stac-map/?href=${encodeURIComponent(feedstock.catalogUrl)}`}
      >
        Open in stac-map
      </ExternalLink>,
    ],
    ['Dataset id', feedstock.slug],
  ]
  return (
    <dl sx={{ m: 0 }}>
      {facts
        .filter(([, value]) => value)
        .map(([name, value]) => (
          <div
            key={name}
            sx={{
              display: 'grid',
              gridTemplateColumns: '90px minmax(0, 1fr)',
              gap: '12px',
              py: '9px',
              borderBottom: '1px solid',
              borderColor: 'line',
              fontSize: '14.5px',
            }}
          >
            <dt sx={{ color: 'secondary' }}>{name}</dt>
            <dd sx={{ m: 0, overflowWrap: 'anywhere' }}>{value}</dd>
          </div>
        ))}
    </dl>
  )
}
