'use client'
import {
  License,
  Maintainers,
  Providers,
  Repository,
} from '@/components/feedstock'
import { Feedstock } from '@/types/types'
import { Button, Column, Link, Row } from '@carbonplan/components'
import { RotatingArrow } from '@carbonplan/icons'
import { Box } from 'theme-ui'

export const FeedstockDetails: React.FC<{ feedstock: Feedstock }> = ({
  feedstock,
}) => {
  return (
    <Box>
      <Row>
        <Column start={[1, 1, 2, 2]} width={[6, 4, 3, 5]}>
          <Maintainers maintainers={feedstock.maintainers} />
        </Column>
        <Column start={[1, 5, 7, 7]} width={[6, 4, 3, 3]}>
          <License
            license={feedstock.provenance?.license}
            license_link={feedstock.provenance?.license_link}
          />
        </Column>
        <Column start={[1, 1, 2, 2]} width={[6, 4, 3, 3]}>
          <Repository source={feedstock.source} />
        </Column>
        <Column start={[1, 5, 7, 7]} width={[6, 4, 3, 3]}>
          <Providers providers={feedstock.provenance?.providers} />
        </Column>
        <Column start={[1, 1, 2, 2]} width={[6, 4, 3, 3]}>
          <Button
            size='xs'
            suffix={<RotatingArrow />}
            as={Link}
            href={`https://developmentseed.org/stac-map/?href=${encodeURIComponent(feedstock.catalogUrl)}`}
            target='_blank'
            rel='noopener noreferrer'
            sx={{ mt: 2 }}
          >
            Open in stac-map
          </Button>
        </Column>
      </Row>
    </Box>
  )
}
