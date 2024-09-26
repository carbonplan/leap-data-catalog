import { Provider } from '@/types/types'
import { Button, Link } from '@carbonplan/components'
import { RotatingArrow } from '@carbonplan/icons'
import { Box, Grid, Text } from 'theme-ui'

interface ProvidersProps {
  providers: Provider[]
}

export const Providers: React.FC<ProvidersProps> = ({ providers }) => {
  return (
    <Box mt={3}>
      <Text sx={{ color: 'muted' }}>Providers:</Text>
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
            {provider.description}
          </Button>
        ))}
      </Grid>
    </Box>
  )
}
