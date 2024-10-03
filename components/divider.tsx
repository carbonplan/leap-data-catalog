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
      <Row columns={[12]}>
        <Column start={[2]} width={[10]}>
          <Divider color={color} />
        </Column>
      </Row>
    </>
  )
}
