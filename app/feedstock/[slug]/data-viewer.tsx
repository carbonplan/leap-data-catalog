'use client'
import { Store } from '@/types/types'
import { Button } from '@carbonplan/components'
import { RotatingArrow } from '@carbonplan/icons'
import React from 'react'
import { Box } from 'theme-ui'

interface DataViewerProps {
  store: Store
  color: string
  showMap: boolean
  onToggle: () => void
}

export const DataViewer: React.FC<DataViewerProps> = ({
  store,
  color,
  showMap,
  onToggle,
}) => {
  const { url, format } = store

  // csv (or other tabular) data: just link to the file.
  if (format === 'csv') {
    return (
      <Box>
        <Button
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          suffix={<RotatingArrow sx={{ transform: 'translateY(-6%)' }} />}
          sx={{
            fontSize: [0, 0, 0, 1],
            letterSpacing: 'mono',
            textTransform: 'uppercase',
            fontFamily: 'mono',
            color,
            cursor: 'pointer',
          }}
        >
          Download CSV
        </Button>
      </Box>
    )
  }

  const enabled = store.public && store.geospatial

  if (!enabled) {
    return (
      <Box sx={{ fontSize: [1, 1, 1, 2] }}>
        Dataset incompatible with Data Viewer
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 3, mb: 2 }}>
        <Button
          onClick={onToggle}
          suffix={
            <RotatingArrow
              sx={{ transform: showMap ? 'rotate(90deg)' : 'translateY(-6%)' }}
            />
          }
          sx={{
            fontSize: [0, 0, 0, 1],
            letterSpacing: 'mono',
            textTransform: 'uppercase',
            fontFamily: 'mono',
            color,
            cursor: 'pointer',
          }}
        >
          {showMap ? 'Hide Map Viewer' : 'Preview in Map Viewer'}
        </Button>
      </Box>
    </Box>
  )
}
