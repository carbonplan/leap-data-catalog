/** @jsxImportSource theme-ui */
interface SearchBoxProps {
  search: string
  setSearch: (value: string) => void
}

export const SearchBox: React.FC<SearchBoxProps> = ({ search, setSearch }) => {
  return (
    <form role='search' onSubmit={(e) => e.preventDefault()}>
      <input
        type='search'
        aria-label='Search datasets'
        placeholder='Search datasets, e.g. ocean carbon or GFS'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          width: '100%',
          height: 44,
          px: '14px',
          fontFamily: 'body',
          fontSize: 2,
          color: 'text',
          bg: 'background',
          border: '1px solid',
          borderColor: 'text',
          borderRadius: 0,
          '::placeholder': { color: 'secondary', opacity: 1 },
        }}
      />
    </form>
  )
}
