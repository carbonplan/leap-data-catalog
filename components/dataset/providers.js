import { Button, Link } from '@carbonplan/components'
import { RotatingArrow } from '@carbonplan/icons'
import { Box, Grid, Text } from 'theme-ui'

export const Providers = ({ providers }) => {
  return (
    <Box pt={3}>
      <Text sx={{ fontSize: 1, fontWeight: 400 }}>Providers:</Text>
      <Grid gap={3} columns={[1, 2]} sx={{ mt: 1 }}>
        {providers.map((provider) => (
          <Button
            size='xs'
            key={provider.name}
            suffix={<RotatingArrow />}
            as={Link}
            href={provider.url}
            target='_blank'
            rel='noopener noreferrer'
          >
            {provider.name}
          </Button>
        ))}
      </Grid>
    </Box>
  )
}
