import { Button, Link } from '@carbonplan/components'
import { RotatingArrow } from '@carbonplan/icons'
import { Box, Grid, Text } from 'theme-ui'

export const Providers = ({ providers }) => {
  return (
    <Box mt={3}>
      <Text sx={{ fontSize: 1, fontWeight: 400, color: 'muted' }}>
        Providers:
      </Text>
      <Grid gap={3} columns={[1, 2]} sx={{ mt: 1 }}>
        {providers.map((provider) => (
          <Button
            size='xs'
            key={provider.label}
            suffix={<RotatingArrow />}
            as={Link}
            href={provider.href}
            target='_blank'
            rel='noopener noreferrer'
          >
            {provider.label}
          </Button>
        ))}
      </Grid>
    </Box>
  )
}
