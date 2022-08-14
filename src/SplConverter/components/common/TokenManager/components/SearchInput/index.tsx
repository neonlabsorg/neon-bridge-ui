import { useStatesContext } from '@/contexts/states'

export const SearchInput = ({
  className = '',
  value = '',
  onChange = () => {},
  placeholder = '',
}: any) => {
  const { theme } = useStatesContext()

  return (
    <>
      <input
        className={`search-input ${className} ${
          theme === 'light' ? 'bg-light-gray' : 'bg-op04-white border-none'
        }  dark:text-white outline-none`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </>
  )
}
