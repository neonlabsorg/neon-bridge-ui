import { ReactComponent as Logo } from '@/assets/logo.svg'
import { useStatesContext } from '@/contexts/states'

const Header = () => {
  const { theme } = useStatesContext()
  return (
    <div className='header'>
      <Logo className={`header__logo ${theme ? 'fill-white' : ''}`} />
    </div>
  )
}

export default Header
