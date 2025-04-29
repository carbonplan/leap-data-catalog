import { Badge, Button } from '@carbonplan/components'
import { X } from '@carbonplan/icons'
import { useCallback, useMemo, useState } from 'react'
import { Box, BoxProps, Flex, IconButton } from 'theme-ui'

const Filter = ({ sx }: BoxProps) => {
  return (
    <Box
      as='svg'
      // @ts-ignore
      viewBox='0 0 22 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      stroke='currentColor'
      strokeWidth='1.5'
      sx={sx}
    >
      <path
        d='M21 1H1L9 10.46V17L13 19V10.46L21 1Z'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Box>
  )
}

interface TagFilterProps {
  tags: string[]
  selectedTags: string[]
  setSelectedTags: (updated: string[]) => void
}

export const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  selectedTags,
  setSelectedTags,
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const selectableTags = useMemo(
    () => tags.filter((tag) => !selectedTags.includes(tag)),
    [tags, selectedTags],
  )

  const removeTag = useCallback(
    (tag: string) => {
      setSelectedTags(selectedTags.filter((el) => el !== tag))
    },
    [selectedTags, setSelectedTags],
  )

  const addTag = useCallback(
    (tag: string) => {
      setSelectedTags([...selectedTags, tag])
    },
    [selectedTags, setSelectedTags],
  )

  return (
    <Box sx={{ position: 'relative', mt: 4 }}>
      <Flex sx={{ gap: 2, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <Button
          onClick={() => setOpen((o) => !o)}
          inverted
          sx={{
            textAlign: 'left',
            fontFamily: 'mono',
            letterSpacing: 'mono',
            textTransform: 'uppercase',
            fontSize: 1,
            minHeight: 24,
            color: open ? 'primary' : undefined,
          }}
          suffix={<Filter sx={{ mt: '-2px' }} />}
        >
          Filter by tag
        </Button>

        {selectedTags.length > 0 && (
          <>
            {selectedTags.map((tag, i) => (
              <Flex key={tag} sx={{ gap: 2, flexWrap: 'nowrap' }}>
                <Badge sx={{ opacity: 0.7 }}>
                  <Button
                    sx={{
                      fontFamily: 'mono',
                      fontSize: 1,
                      textTransform: 'uppercase',
                      py: '3px',
                    }}
                    suffix={<X sx={{ height: 10, width: 10 }} />}
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                  </Button>
                </Badge>
                {i === selectedTags.length - 1 && (
                  <Button
                    size='xs'
                    inverted
                    sx={{
                      fontFamily: 'mono',
                      letterSpacing: 'mono',
                      textTransform: 'uppercase',
                      fontSize: 0,
                    }}
                    onClick={() => setSelectedTags([])}
                  >
                    Clear
                  </Button>
                )}
              </Flex>
            ))}
          </>
        )}
      </Flex>

      {open && (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            bg: 'background',
            border: '1px solid',
            borderColor: 'muted',
            mt: 1,
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1,
          }}
        >
          <Flex sx={{ justifyContent: 'flex-end' }}>
            <IconButton
              role='button'
              aria-label='Close'
              sx={{
                cursor: 'pointer',
                height: '24px',
                width: '24px',
                m: 1,
                transition: '0.2s all',
                '@media (hover: hover) and (pointer: fine)': {
                  '&:hover': {
                    color: 'secondary',
                  },
                },
              }}
              onClick={() => setOpen(false)}
            >
              <X />
            </IconButton>
          </Flex>

          <Flex sx={{ flexWrap: 'wrap', mt: -4, gap: 2, px: 2, pb: 3 }}>
            {selectableTags.map((tag) => (
              <Badge key={tag} sx={{ opacity: 0.7 }}>
                <Button
                  sx={{
                    fontFamily: 'mono',
                    fontSize: 1,
                    py: '3px',
                    textTransform: 'uppercase',
                  }}
                  onClick={() => addTag(tag)}
                >
                  {tag}
                </Button>
              </Badge>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  )
}
