'use client'
import { Store } from '@/types/types'
import dynamic from 'next/dynamic'
import React from 'react'
import { Box } from 'theme-ui'

const ZarrMapViewer = dynamic(
  () => import('./zarr-map-viewer').then((m) => m.ZarrMapViewer),
  { ssr: false, loading: () => <Box sx={{ fontSize: 0 }}>loading...</Box> },
)

interface DataViewerProps {
  store: Store
  color: string
}

export const DataViewer: React.FC<DataViewerProps> = ({ store, color }) =>
  store.viewer ? (
    <ZarrMapViewer url={store.url} color={color} />
  ) : (
    <Box sx={{ fontSize: [1, 1, 1, 2] }}>No map preview for this dataset</Box>
  )
