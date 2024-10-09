/** @jsxImportSource theme-ui */
import { ThemeUIStyleObject } from 'theme-ui'
import { Row, Column } from '@carbonplan/components'

interface DividerProps {
  color?: string
  sx?: ThemeUIStyleObject
}

export function Divider({ color = 'gray', sx = {} }: DividerProps) {
  return (
    <hr
      sx={{
        width: '100%',
        borderTop: '1px solid',
        borderColor: color,
        ...sx,
      }}
    />
  )
}

export const SectionDivider: React.FC<{ color: string }> = ({ color }) => {
  return (
    <>
      <Row columns={[6, 6, 8, 12]}>
        <Column start={[1, 1, 1, 2]} width={[6, 6, 8, 10]}>
          <Divider color={color} />
        </Column>
      </Row>
    </>
  )
}
