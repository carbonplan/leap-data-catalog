/** @jsxImportSource theme-ui */
import { ThemeUIStyleObject } from 'theme-ui'

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
