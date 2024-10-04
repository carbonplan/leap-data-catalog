import {
  License,
  Maintainers,
  Repository,
  Providers,
} from '@/components/feedstock'
import { Feedstock } from '@/types/types'
import { Column, Row } from '@carbonplan/components'
import { Box, Grid } from 'theme-ui'

export const FeedstockDetails: React.FC<{ feedstock: Feedstock }> = ({
  feedstock,
}) => {
  return (
    <Box sx={{ ml: [3, 4, 5, 6] }}>
      <Row>
        <Column start={[1, 1, 2, 2]} width={[6, 6, 8, 10]}>
          <Grid columns={[1, 1, 2, 2]}>
            <Box>
              <Maintainers maintainers={feedstock.maintainers} />
            </Box>
            <Box>
              <License
                license={feedstock.provenance?.license}
                license_link={feedstock.provenance?.license_link}
              />
            </Box>
            <Box>
              <Repository metaURL={feedstock['ncviewjs:meta_yaml_url']} />
            </Box>
            <Box>
              <Providers providers={feedstock.provenance?.providers} />
            </Box>
          </Grid>
        </Column>
      </Row>
    </Box>
  )
}
