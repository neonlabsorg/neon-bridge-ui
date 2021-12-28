import React from 'react'
// import { useWallet } from '@solana/wallet-adapter-react';
// import { useCurrencyBalance } from 'state/wallet/hooks'
// import { useWalletAdapters } from '../hooks/useSourceWallet'
import { SourceCard } from '../SourceCard'
// import { useWeb3React } from '@web3-react/core';
// import Button from '@/common/Button'
// import Switcher from '@/common/Switcher';
import NeonTransferer from './children/NeonTransferer';
import { useWeb3React } from '@web3-react/core'
import { useWallet } from '@solana/wallet-adapter-react'






const Connection = ({
  direction = 'neon',
  className = '',
  onToggleDirection = () => {},
  onSignTransfer = () => {}
}) => {
  const { publicKey } = useWallet()
  const { account, error } = useWeb3React()
  return <div className={`w-full py-3 ${className}`}>
    {/* <div className='flex items-center mb-4'>
      <span className='mr-4'>{'Reverse convertation'}</span>
      <Switcher active={direction === 'solana'}
        onClick={onToggleDirection}/>
    </div> */}
    <div className='flex xs:flex-col sm:flex-row'>
      <div className='sm:w-1/2 xs:w-full flex flex-col sm:pr-8 xs:mb-4'>
        <div className='text-2xl mb-6'>Source</div>
        <SourceCard sourceName={direction === 'neon' ? 'solana' : direction === 'solana' ? 'neon' : 'solana'} />
      </div>
      <div className='sm:w-1/2  xs:w-full flex flex-col items-start xs:mb-4'>
        <div className='text-2xl mb-6'>Target</div>
        <SourceCard sourceName={direction} />
      </div>
    </div>

    {publicKey && account && !error ? <NeonTransferer direction={direction} onSignTransfer={onSignTransfer}/> : null }
    
    
    {/* <Button className='self-start' onClick={onNextStep}
      disabled={!publicKey || !active}>Next</Button> */}

  </div>
}
export default Connection