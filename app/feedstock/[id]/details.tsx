import {
  License,
  Maintainers,
  Repository,
  Providers,
} from '@/components/feedstock'
import { Feedstock } from '@/types/types'
import { Column, Row } from '@carbonplan/components'
import { Box, Flex } from 'theme-ui'

export const FeedstockDetails: React.FC<{ feedstock: Feedstock }> = ({
  feedstock,
}) => {
  return (
    <Box sx={{ ml: [3, 4, 5, 6] }}>
      <Row columns={[1, 1, 12, 12]}>
        <Column start={[1, 1, 2, 2]} width={[1, 1, 10, 10]}>
          <Flex
            sx={{
              flexDirection: ['column', 'column', 'row', 'row'],
              gap: [4, 4, 6, 6],
              justifyContent: 'space-between',
              alignItems: ['stretch', 'flex-start'],
            }}
          >
            <Maintainers maintainers={feedstock.maintainers} />
            <License
              license={feedstock.provenance?.license}
              license_link={feedstock.provenance?.license_link}
            />
            <Repository metaURL={feedstock['ncviewjs:meta_yaml_url']} />
            <Providers providers={feedstock.provenance?.providers} />
          </Flex>
        </Column>
      </Row>
    </Box>
  )
}
