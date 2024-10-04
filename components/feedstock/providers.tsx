import { Provider } from '@/types/types'
import { Button, Link } from '@carbonplan/components'
import { RotatingArrow } from '@carbonplan/icons'
import { Box, Grid, Text } from 'theme-ui'

interface ProvidersProps {
  providers: Provider[]
}

export const Providers: React.FC<ProvidersProps> = ({ providers }) => {
  return (
    <Box>
      <Text
        sx={{
          color: 'muted',
          fontSize: 0,
          fontFamily: 'mono',
          letterSpacing: 'mono',
          textTransform: 'uppercase',
        }}
      >
        Providers
      </Text>
      <Grid gap={2} columns={[1]} sx={{ mt: 3 }}>
        {providers.map((provider) => (
          <Button
            size='xs'
            key={provider.name}
            suffix={<RotatingArrow />}
            as={Link}
            href={provider.url}
            target='_blank'
            rel='noopener noreferrer'
            sx={{ textDecoration: 'none' }}
          >
            {provider.description}
          </Button>
        ))}
      </Grid>
    </Box>
  )
}
