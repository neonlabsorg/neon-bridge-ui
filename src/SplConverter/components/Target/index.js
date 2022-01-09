import { useStatesContext } from "../../../contexts/states"
import { SourceCard } from "../common/SourceCard"
import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import Web3Status from '@/common/Web3Status'
import { useWeb3React } from "@web3-react/core";
import Button from "@/common/Button";
import { TransferInfo } from "../common/TransferInfo";

export const Target = () => {
  const {direction, finishStep} = useStatesContext()
  const {active} = useWeb3React()
  return <div className='w-full flex flex-col'>
    <SourceCard direction={direction} prefix='To' className='mb-6'/>
    {direction === 'solana' ?
      <WalletModalProvider>
        <WalletMultiButton />
      </WalletModalProvider> :
      direction === 'neon' ? <>
        <Web3Status className='mb-6 self-center'/>
      </> : null
    }
    {active ? <TransferInfo/> : null}
    <Button disabled={!active} onClick={() => finishStep('target')}>{'Next'}</Button>
  </div>
}