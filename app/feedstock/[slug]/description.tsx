'use client'
import { Links } from '@/components/feedstock'
import { Tags } from '@/components/feedstock/tags'
import { Feedstock } from '@/types/types'
import { Column, Row } from '@carbonplan/components'
import { Box } from 'theme-ui'

export const FeedstockDescription: React.FC<{ feedstock: Feedstock }> = ({
  feedstock,
}) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Row sx={{ mb: 4 }}>
        <Column start={[1, 1, 2, 2]} width={[6, 6, 6, 6]}>
          {feedstock.tags && (
            <Box sx={{ mt: 3 }}>
              <Tags tags={feedstock.tags} />
            </Box>
          )}
        </Column>
      </Row>
      <Row>
        <Column start={[1, 1, 2, 2]} width={[6, 6, 6, 6]}>
          {' '}
          <Box sx={{ fontSize: [2, 2, 2, 3] }}>{feedstock.description}</Box>
        </Column>
        <Column
          start={[1, 1, 9, 9]}
          width={[6, 8, 3, 3]}
          sx={{ mt: [4, 4, 0, 0] }}
        >
          <Box>{feedstock.links && <Links links={feedstock.links} />}</Box>
        </Column>
      </Row>
    </Box>
  )
}
