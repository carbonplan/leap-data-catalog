/** @jsxImportSource theme-ui */
import { Column, Row } from '@carbonplan/components'
import { ThemeUIStyleObject } from 'theme-ui'

interface DividerProps {
  color?: string
  sx?: ThemeUIStyleObject
}

export const SectionDivider: React.FC<DividerProps> = ({
  color = 'gray',
  sx = {},
}) => {
  return (
    <>
      <Row columns={[6, 6, 8, 12]}>
        <Column start={[1, 1, 1, 2]} width={[6, 6, 8, 10]}>
          <hr
            sx={{
              width: '100%',
              borderTop: '1px solid',
              borderColor: color,
              ...sx,
            }}
          />
        </Column>
      </Row>
    </>
  )
}
