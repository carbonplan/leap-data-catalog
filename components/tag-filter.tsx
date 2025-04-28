import { useCallback, useMemo } from 'react'
import Select, { MultiValue } from 'react-select'

interface TagFilterProps {
  tags: string[]
  selectedTags: string[]
  setSelectedTags: (updated: string[]) => void
}

type TagOption = {
  value: string
  label: string
}

export const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  selectedTags,
  setSelectedTags,
}) => {
  const options = useMemo(() => {
    return Array.from(tags).map((tag) => ({
      value: tag,
      label: tag.toUpperCase(),
    }))
  }, [tags])

  const value = useMemo(() => {
    return selectedTags.map((tag) => ({ value: tag, label: tag.toUpperCase() }))
  }, [selectedTags])

  const handleChange = useCallback(
    (value: MultiValue<TagOption>) => {
      setSelectedTags(value.map((d) => d.value))
    },
    [setSelectedTags],
  )

  return (
    <Select value={value} onChange={handleChange} options={options} isMulti />
  )
}
