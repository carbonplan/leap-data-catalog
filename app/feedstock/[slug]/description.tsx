'use client'
import { Links } from '@/components/feedstock'
import { Tags } from '@/components/feedstock/tags'
import { Feedstock } from '@/types/types'
import { Column, Row } from '@carbonplan/components'
import { Box, Flex, Grid } from 'theme-ui'

export const FeedstockDescription: React.FC<{ feedstock: Feedstock }> = ({
  feedstock,
}) => {
  return (
    <Box sx={{ ml: [3, 4, 5, 6] }}>
      <Row columns={[1, 1, 12, 12]}>
        <Column start={[1, 1, 2, 2]} width={[1, 1, 6, 6]}>
          <Flex sx={{ flexDirection: 'column', gap: [3, 4] }}>
            {feedstock.tags && (
              <Box sx={{ mb: 2 }}>
                <Tags tags={feedstock.tags} />
              </Box>
            )}
            <Box sx={{ fontSize: [2, 2, 2, 3] }}>{feedstock.description}</Box>
          </Flex>
        </Column>
        <Column start={[1, 1, 9, 9]} width={[1, 1, 3, 3]}>
          <Box
            sx={{
              mt: feedstock.tags ? 'calc(46px + 0.5em)' : 0,
              ml: [0, 0, -4, -5],
              pl: [0, 0, 1, 0],
            }}
          >
            {feedstock.links && <Links links={feedstock.links} />}
          </Box>
        </Column>
      </Row>
    </Box>
  )
}
