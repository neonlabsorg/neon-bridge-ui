import BaseHeader from './BaseHeader'
import StatusBlock from '@/SplConverter/components/common/StatusBlock';
import {useStatesContext} from "@/contexts/states";
import {Transferring} from "@/SplConverter/components/Transfering";
const Layout = ({ children = null, bodyClassName = '', className = '' }) => {
  const { steps, pending, neonTransferSign, solanaTransferSign, confirmation } = useStatesContext();

  return (
    <div className={`${className} bg-main-bg-color min-h-screen text-white relative`}>
      <BaseHeader></BaseHeader>

      <div className='layout-body max-w-[605px] w-full mx-auto'>
        <div className='text-center mt-4 mb-10 text-light-grey text-headline tracking-tighten'>
          Little wrapper that transfers your tokens
          <br/>
          between Solana and Neon EVM
        </div>
        {children}
      </div>
      {
        pending === true || solanaTransferSign || neonTransferSign || confirmation
          ? <StatusBlock />
          : null
      }
    </div>
  )
}

export default Layout
