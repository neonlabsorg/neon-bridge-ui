import { useStatesContext } from '@/contexts/states'
import { ReactComponent as SwitchIcon } from '@/assets/theme-switcher.svg'

const ThemeSwitcher = () => {
  const { toggleTheme } = useStatesContext()
  return (
    <div>
      <SwitchIcon className='theme-switcher' onClick={() => toggleTheme()} />
    </div>
  )
}

export default ThemeSwitcher
