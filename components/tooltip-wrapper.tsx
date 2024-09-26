import React, { useState } from 'react'
import { IconButton, Box, Flex, ThemeUIStyleObject } from 'theme-ui'
import { Info } from '@carbonplan/icons'
import AnimateHeight from 'react-animate-height'

interface TooltipProps {
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  sx?: ThemeUIStyleObject
}

const Tooltip: React.FC<TooltipProps> = ({ expanded, setExpanded, sx }) => {
  return (
    <IconButton
      onClick={() => setExpanded(!expanded)}
      role='checkbox'
      aria-checked={expanded}
      aria-label='Information'
      sx={{
        cursor: 'pointer',
        height: '16px',
        width: '16px',
        '@media (hover: hover) and (pointer: fine)': {
          '&:hover > #info': {
            stroke: 'primary',
          },
        },
        p: [0],
        transform: 'translate(0px, -3.75px)',
        ...sx,
      }}
    >
      <Info
        id='info'
        sx={{
          stroke: expanded ? 'primary' : 'secondary',
          transition: '0.1s',
        }}
      />
    </IconButton>
  )
}

interface TooltipWrapperProps {
  children: React.ReactNode
  tooltip?: string
  mt?: string
  color?: string
  sx?: ThemeUIStyleObject
}

export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  tooltip,
  mt = '8px',
  color,
  sx,
}) => {
  const [expanded, setExpanded] = useState(false)

  return tooltip ? (
    <>
      <Flex
        sx={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 2,
          ...sx,
        }}
      >
        <Tooltip
          expanded={expanded}
          setExpanded={setExpanded}
          sx={{ mt: mt, flexShrink: 0 }}
        />
        {children}
      </Flex>
      <AnimateHeight
        duration={100}
        height={expanded ? 'auto' : 0}
        easing={'linear'}
      >
        <Box sx={{ mt: 2, fontSize: [1, 1, 1, 2], color }}>{tooltip}</Box>
      </AnimateHeight>
    </>
  ) : (
    <>{children}</>
  )
}