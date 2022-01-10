import { useStatesContext } from "../../../contexts/states"
import {ReactComponent as LoaderIcon} from '@/assets/loader.svg'
import {ReactComponent as CloseIcon} from '@/assets/close.svg'
import {ReactComponent as DoneIcon} from '@/assets/done.svg'
export const Transfering = () => {
  const {transfering, setTransfering,
    solanaTransferSign, setSolanaTransferSign,
    setAmount, resetSteps,
    neonTransferSign, setNeonTransferSign} = useStatesContext()
  const handleRepeatScript = () => {
    setSolanaTransferSign('')
    setNeonTransferSign('')
    resetSteps()
    setTransfering(false)
    setAmount(0)
  }
  if (transfering) {
    return <div className='loader'>
      <div className='loader__icon'>
        <LoaderIcon/>
      </div>
      <div className='loader__title'>Processing transaction</div>
      <div className='loader__summary'>
        Usually takes 1-30 seconds to complete,<br/>
        don’t close browser window just yet</div>
    </div>
  } else if (solanaTransferSign || neonTransferSign) {
    return <div className='flex flex-col items-center min-w-420px p-6 bg-white'>
      <CloseIcon className='self-end mb-10 cursor-pointer'
        onClick={handleRepeatScript}/>
      <DoneIcon className='mb-10'/>
      <div className='font-medium text-xl mb-6'>Transfer complete</div>
      <a href={`https://etherscan.io/tx/${neonTransferSign}`}
        target='_blank'
        rel='noopener noreferrer'
        className='text-blue-500'>View on Etherscan</a>
      {neonTransferSign ?
        <a href={`https://etherscan.io/tx/${neonTransferSign}`}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-500'>View on Etherscan</a> : null}
      {solanaTransferSign ? 
        <a href={`https://solscan.io/tx/${solanaTransferSign}?cluster=devnet`}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-500'>View on Solana Explorer</a> : null}
    </div>
  } else {
    <></>
  }
}