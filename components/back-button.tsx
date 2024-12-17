'use client'
import { Button } from '@carbonplan/components'
import { Left } from '@carbonplan/icons'
import { useRouter, useSearchParams } from 'next/navigation'
import { ThemeUIStyleObject } from 'theme-ui'

interface BackButtonProps {
  href?: string
  preserveQuery?: boolean
  sx?: ThemeUIStyleObject
}

export const BackButton: React.FC<BackButtonProps> = ({
  href = '/',
  preserveQuery = false,
  sx,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleClick = () => {
    if (preserveQuery) {
      const currentParams = new URLSearchParams(searchParams.toString())
      const newUrl = `${href}${
        currentParams.toString() ? '?' + currentParams.toString() : ''
      }`
      router.push(newUrl)
    } else {
      router.push(href)
    }
  }

  return (
    <Button inverted size='xs' onClick={handleClick} prefix={<Left />} sx={sx}>
      Back
    </Button>
  )
}
