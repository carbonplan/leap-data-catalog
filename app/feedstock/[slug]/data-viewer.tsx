'use client'
import { Store } from '@/types/types'
import { Button } from '@carbonplan/components'
import { Arrow, RotatingArrow } from '@carbonplan/icons'
import React from 'react'
import { Box } from 'theme-ui'

interface DataViewerProps {
  store: Store
  color: string
}

export const DataViewer: React.FC<DataViewerProps> = ({ store, color }) => {
  const { id, name, url, rechunking } = store
  const pyramid =
    rechunking && rechunking.length > 0 ? rechunking[0].path : null

  const enabled = store.public && store.geospatial

  return enabled ? (
    <Button
      href={`https://ncview-js.staging.carbonplan.org/?dataset=${
        pyramid || url
      }`}
      target='_blank'
      rel='noopener noreferrer'
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (!enabled) {
          e.preventDefault()
        }
      }}
      suffix={
        enabled ? (
          <RotatingArrow
            sx={{
              transform: ['translateY(-6%)'],
            }}
          />
        ) : (
          <Arrow />
        )
      }
      sx={{
        fontSize: [0, 0, 0, 1],
        letterSpacing: 'mono',
        textTransform: 'uppercase',
        fontFamily: 'mono',
        mt: 3,
        mb: 2,
        cursor: enabled ? 'pointer' : 'not-allowed',
        color: enabled ? color : 'secondary',
      }}
    >
      Open in Data Viewer
    </Button>
  ) : (
    <Box sx={{ fontSize: [1, 1, 1, 2] }}>
      Dataset incompatible with Data Viewer
    </Box>
  )
}
