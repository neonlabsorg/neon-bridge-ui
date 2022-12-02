import { ReactComponent as LogoSingle } from '@/assets/logo-single.svg'

const Header = () => {
  return (
    <div className='grid grid-cols-3 my-4 mx-6'>
      <div>
        <LogoSingle />
      </div>
      <div className='text-center text__headline'>
        NEONPASS
      </div>
      <div className='text-right text__link'>
        <ul className='flex justify-end'>
          <li className='cursor-pointer select-none'>
            <a rel='noopener noreferrer' target='_blank' href='https://neon-labs.org'>
              Neon Website
            </a>
          </li>
          <li className='cursor-pointer ml-5 select-none'>
            Help
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Header
