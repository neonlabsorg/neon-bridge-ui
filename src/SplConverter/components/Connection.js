import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react';
// import { useActiveWeb3React } from '../hooks'
// import { useCurrencyBalance } from 'state/wallet/hooks'
// import { useWalletAdapters } from '../hooks/useSourceWallet'
import { SourceCard } from './SourceCard'
import { useWeb3React } from '@web3-react/core';
import Button from '../../common/Button'





const Connection = ({
  direction = 'neon',
  className = '',
  onNextStep = () => {}
}) => {
  const { active } = useWeb3React()
  // const adapters = useWalletAdapters()
  const { publicKey } = useWallet()
  // const balance = useCurrencyBalance(account)


  return <div className={`w-full py-3 ${className}`}>
    <div className='flex'>
      <div className='w-1/2 flex flex-col pr-4'>
        <div className='text-lg mb-6'>Source</div>
        <SourceCard sourceName={direction === 'neon' ? 'solana' : direction} />
      </div>
      <div className='w-1/2 flex flex-col items-start pl-4'>
        <div className='text-lg mb-6'>Target</div>
        <SourceCard sourceName={direction} />
      </div>
    </div>
    <Button className='self-start' onClick={onNextStep}
      disabled={!publicKey || !active}>Next</Button>

  </div>
}
export default Connection