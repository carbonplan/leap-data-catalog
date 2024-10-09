'use client'
import { Button } from '@carbonplan/components'
import { Left } from '@carbonplan/icons'
import { useRouter } from 'next/navigation'
import { ThemeUIStyleObject } from 'theme-ui'

interface BackButtonProps {
  href?: string
  sx?: ThemeUIStyleObject
}

export const BackButton: React.FC<BackButtonProps> = ({ href = '/', sx }) => {
  const router = useRouter()

  return (
    <Button
      inverted
      size='xs'
      onClick={() => {
        router.push(href)
      }}
      prefix={<Left />}
      sx={sx}
    >
      Back
    </Button>
  )
}
