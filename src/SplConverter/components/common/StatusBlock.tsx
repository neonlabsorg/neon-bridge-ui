import {useStatesContext} from "@/contexts/states";
import { ReactComponent as LoaderIcon } from '@/assets/loader-new.svg';
import { ReactComponent as CompleteNew } from '@/assets/complete-new.svg';
import { ReactComponent as LinkNew } from '@/assets/link-new.svg';

const { REACT_APP_NETWORK } = process.env;

const ASSOC_TX_EXPLORERS = {
  'devnet': 'https://neonscan.org',
  'testnet': 'https://neonscan.org',
  'mainnet-beta': 'https://neonscan.org'
};

export function StatusBlock() {
  const { pending, solanaTransferSign, neonTransferSign, resetStates, confirmation } = useStatesContext();

  const urlForExplorer = () => neonTransferSign
    ? `${ASSOC_TX_EXPLORERS[REACT_APP_NETWORK]}/tx/${neonTransferSign}?network=${REACT_APP_NETWORK || 'devnet'}`
    : `https://solscan.io/tx/${solanaTransferSign}?cluster=${REACT_APP_NETWORK || 'devnet'}`

  if(confirmation) {
    return (
      <div className={`absolute top-0 h-full left-0 w-full backdrop-blur-[25px] flex flex-col items-center justify-center text-center`} />
    )
  }

  if (pending) {
    return (
      <div className={`absolute top-0 h-full left-0 w-full backdrop-blur-[25px] flex items-center justify-center flex-col`}>
        <div className='text-center'>
          <LoaderIcon className='mb-6 mx-auto'/>
          <div className='mb-3 text-[24px] text-text-purple leading-[24px] font-bold tracking-tight'>
            Processing transaction
          </div>
          <div className='tracking-tight text-center'>
            Usually takes 1-30 seconds to complete,<br/>
            don’t close browser window just yet
          </div>
        </div>
      </div>
    )
  }

  if (neonTransferSign || solanaTransferSign) {
    return (
      <div className={`absolute top-0 h-full left-0 w-full backdrop-blur-[25px] flex flex-col items-center justify-center text-center`}>
        <CompleteNew className='mt-auto mb-6 mx-auto'/>
        <div className='mb-8 text-[24px] text-text-purple leading-[24px] font-bold tracking-tight'>
          Transfer complete
        </div>
        <button
          onClick={resetStates}
          className='border border-border-color min-w-[169px] rounded-full py-[10px] tracking-tight font-bold'>
          Close
        </button>

        <div className='mt-auto mb-8'>
          <a className='font-medium flex items-center text-link-hover-color' rel='noopener noreferrer' target='_blank' href={urlForExplorer()}>
            View on Solana Explorer
            <LinkNew className='ml-1' />
          </a>
        </div>
      </div>
    )
  }
}

export default StatusBlock

