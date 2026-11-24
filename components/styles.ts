import { ThemeUICSSObject } from 'theme-ui'

export const wrapSx: ThemeUICSSObject = {
  maxWidth: 1360,
  mx: 'auto',
  px: 3,
  '@media (min-width: 800px)': { px: 5 },
}

export const labelSx: ThemeUICSSObject = {
  fontFamily: 'mono',
  fontSize: 0,
  letterSpacing: 'mono',
  textTransform: 'uppercase',
  color: 'secondary',
}

export const headingSx: ThemeUICSSObject = {
  m: 0,
  fontFamily: 'heading',
  fontWeight: 500,
  letterSpacing: 'heading',
  textWrap: 'balance',
}

export const controlSx: ThemeUICSSObject = {
  height: 36,
  px: '12px',
  fontFamily: 'body',
  fontSize: 1,
  color: 'text',
  bg: 'background',
  border: '1px solid',
  borderColor: 'line',
  borderRadius: 0,
  cursor: 'pointer',
  ':hover': { borderColor: 'text' },
}

export const pressedSx: ThemeUICSSObject = {
  bg: 'text',
  color: 'background',
  borderColor: 'text',
}

export const chipSx: ThemeUICSSObject = {
  ...controlSx,
  height: 30,
  px: '10px',
  fontSize: '13px',
}

export const checkSx: ThemeUICSSObject = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  minHeight: 32,
  fontSize: 1,
  cursor: 'pointer',
  input: { width: 16, height: 16, m: 0, flex: 'none', accentColor: '#1b1e23' },
}

export const specSx: ThemeUICSSObject = {
  m: 0,
  fontFamily: 'mono',
  fontSize: '12.5px',
  lineHeight: 1.5,
  color: 'secondary',
}

export const plainListSx: ThemeUICSSObject = {
  listStyle: 'none',
  m: 0,
  p: 0,
}

export const gridSx: ThemeUICSSObject = {
  ...plainListSx,
  display: 'grid',
  gap: '22px',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))',
}
