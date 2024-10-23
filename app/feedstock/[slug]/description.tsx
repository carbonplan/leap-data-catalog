'use client'
import { Links } from '@/components/feedstock'
import { Tags } from '@/components/feedstock/tags'
import { Feedstock } from '@/types/types'
import { Column, Row } from '@carbonplan/components'
import { Box, Flex } from 'theme-ui'

export const FeedstockDescription: React.FC<{ feedstock: Feedstock }> = ({
  feedstock,
}) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Row>
        <Column start={[1, 1, 2, 2]} width={[6, 6, 6, 6]}>
          <Flex sx={{ flexDirection: 'column', gap: [3, 4] }}>
            {feedstock.tags && (
              <Box sx={{mt: 3}}>
                <Tags tags={feedstock.tags} />
              </Box>
            )}
            <Box sx={{ fontSize: [2, 2, 2, 3] }}>{feedstock.description}</Box>
          </Flex>
        </Column>
        <Column start={[1, 1, 9, 9]} width={[6, 8, 3, 3]}>
          <Box>{feedstock.links && <Links links={feedstock.links} />}</Box>
        </Column>
      </Row>
    </Box>
  )
}
