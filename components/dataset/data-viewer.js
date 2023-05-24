import { LinkGroup } from '@carbonplan/components'
import { Box } from 'theme-ui'

const dataViewerInstance = 'https://ncview-js.staging.carbonplan.org'
export const DataViewer = ({ store }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <LinkGroup
        members={[
          {
            label: `Explore ${store.name}`,
            href: `${dataViewerInstance}/?dataset=${store.href}`,
          },
        ]}
      />
    </Box>
  )
}
