import {
  getRandomIndexFromHash,
  getUniqueHashFromString,
} from '@/utils/string-hash'

const colors = [
  'DarkViolet',
  'cadetBlue',
  'yellow',
  'forestGreen',
  'SeaGreen',
  'Teal',
  'Darkorange',
  'DeepSkyBlue',
  'DarkCyan',
  'Tomato',
  'DarkGreen',
  'SteelBlue',
  'Sienna',
]

export const getColor = (title: string) => {
  const hash = getUniqueHashFromString(title)

  const colorIndex = getRandomIndexFromHash(hash, colors.length)

  return colors[colorIndex]
}
