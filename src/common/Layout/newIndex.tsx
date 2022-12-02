import BaseHeader from './BaseHeader'
const Layout = ({ children = null, bodyClassName = '', className = '' }) => {
  return (
    <div className={`${className} bg-main-bg-color min-h-screen text-white`}>
      <BaseHeader></BaseHeader>

      <div className='layout-body max-w-[605px] w-full mx-auto'>
        <div className='text-center mt-4 mb-10 text-light-grey text-headline tracking-tighten'>
          Little wrapper that transfers your tokens
          <br/>
          between Solana and Neon EVM
        </div>
        {children}
      </div>
    </div>
  )
}

export default Layout
