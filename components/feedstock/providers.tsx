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
      <Box sx={{ mb: 2, mt: 2 }}>
        {' '}
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
      </Box>

      <Grid gap={2} columns={[1]}>
        {providers.map((provider) =>
          provider.url ? (
            <Button
              size='xs'
              key={provider.name}
              suffix={<RotatingArrow />}
              as={Link}
              href={provider.url}
              target='_blank'
              rel='noopener noreferrer'
              sx={{
                textDecoration: 'none',
              }}
            >
              {provider.name}
            </Button>
          ) : (
            <Box key={provider.name} sx={{ fontSize: [2, 2, 2, 3] }}>
              {provider.name}
            </Box>
          ),
        )}
      </Grid>
    </Box>
  )
}
