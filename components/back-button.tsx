'use client'
import { openedFromList } from '@/utils/use-view'
import { Button } from '@carbonplan/components'
import { Left } from '@carbonplan/icons'
import { useRouter } from 'next/navigation'
import { ThemeUIStyleObject } from 'theme-ui'

interface BackButtonProps {
  sx?: ThemeUIStyleObject
}

export const BackButton: React.FC<BackButtonProps> = ({ sx }) => {
  const router = useRouter()

  const handleClick = () =>
    openedFromList(window.location.pathname) ? router.back() : router.push('/')

  return (
    <Button inverted size='xs' onClick={handleClick} prefix={<Left />} sx={sx}>
      Back
    </Button>
  )
}
