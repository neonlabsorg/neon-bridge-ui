import {ReactComponent as LogoLight} from '../../../assets/logo.svg'
import {ReactComponent as LogoDark} from '../../../assets/logo_dark.svg'
import { useStatesContext } from '../../../contexts/states'
import { useMemo } from 'react'
// import Web3Status from '../../Web3Status'

const Header = () => {
  const {theme} = useStatesContext()
  const Logo = useMemo(() => {
    return theme === 'light' ? LogoLight : LogoDark
  }, [theme])
  return <div className='header'>
    <Logo className='header__logo' />
  </div>
}

export default Header
