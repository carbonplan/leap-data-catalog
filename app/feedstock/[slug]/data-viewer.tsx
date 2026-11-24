/** @jsxImportSource theme-ui */
'use client'
import { Feedstock, Store } from '@/types/types'
import dynamic from 'next/dynamic'

const ZarrMapViewer = dynamic(
  () => import('./zarr-map-viewer').then((m) => m.ZarrMapViewer),
  { ssr: false, loading: () => <p sx={{ m: 0, fontSize: 1 }}>loading...</p> },
)

interface DataViewerProps {
  store: Store
  bbox: Feedstock['bbox']
}

export const DataViewer = ({ store, bbox }: DataViewerProps) =>
  store.viewer ? (
    <ZarrMapViewer url={store.url} bbox={bbox} />
  ) : (
    <p
      sx={{
        m: 0,
        px: '14px',
        py: '10px',
        bg: 'hinted',
        fontSize: 1,
        color: 'secondary',
      }}
    >
      No map preview for this dataset.
    </p>
  )
