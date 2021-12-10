import React from 'react'
// import { useWallet } from '@solana/wallet-adapter-react';
// import { useActiveWeb3React } from '../hooks'
// import { useCurrencyBalance } from 'state/wallet/hooks'
// import { useWalletAdapters } from '../hooks/useSourceWallet'
import { SourceCard } from '../SourceCard'
// import { useWeb3React } from '@web3-react/core';
// import Button from '@/common/Button'
// import Switcher from '@/common/Switcher';
import NeonTransferer from './children/NeonTransferer';






const Connection = ({
  direction = 'neon',
  className = '',
  // onToggleDirection = () => {},
  onSignTransfer = () => {}
}) => {

  return <div className={`w-full py-3 ${className}`}>
    <div className='flex xs:flex-col sm:flex-row'>
      <div className='sm:w-1/2 xs:w-full flex flex-col pr-4'>
        <div className='text-lg mb-6'>Source</div>
        <SourceCard sourceName={direction === 'neon' ? 'solana' : direction === 'solana' ? 'neon' : 'solana'} />
      </div>
      <div className='sm:w-1/2  xs:w-full flex flex-col items-start pl-4'>
        <div className='text-lg mb-6'>Target</div>
        <SourceCard sourceName={direction} />
      </div>
    </div>
    <NeonTransferer onSignTransfer={onSignTransfer}/>
    {/* <div className='flex items-center mb-4'>
      <span className='mr-4'>{'Reverse convertation'}</span>
      <Switcher active={direction === 'solana'}
        onClick={onToggleDirection}/>
    </div> */}
    
    {/* <Button className='self-start' onClick={onNextStep}
      disabled={!publicKey || !active}>Next</Button> */}

  </div>
}
export default Connection