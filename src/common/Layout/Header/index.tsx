import { useStatesContext } from '@/contexts/states'
import { ReactComponent as Logo } from '@/assets/logo.svg'

const Header = () => {
  const { theme } = useStatesContext()
  return (
    <div className='header'>
      <Logo className={`header__logo ${theme ? 'fill-white' : ''}`} />
    </div>
  )
}

export default Header
