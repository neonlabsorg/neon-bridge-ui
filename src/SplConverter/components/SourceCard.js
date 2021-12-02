import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react';
import { useWeb3React } from '@web3-react/core';
import Web3Status from '../../common/Web3Status'
import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

const SourceCard = ({sourceName = 'solana'}) => {
  const { active } = useWeb3React()
  const { publicKey } = useWallet()
  return <>
    <div className='flex mb-4'>
      {sourceName === 'solana' ? 
        <>
          <span className='ml-4 text-3xl'>Solana</span>
        </>
      :
        <>
          <span className='ml-4 text-3xl'>Neon</span>
        </>}
    </div>
    {(sourceName === 'solana' && publicKey) ||
      (sourceName === 'neon' && active) ? 'Connected' : 'Disconnected'}
    <div className='flex py-4 mb-4'>
      {sourceName === 'solana' ?
        <WalletModalProvider>
        <WalletMultiButton />
      </WalletModalProvider>
      :
        sourceName === 'neon' ? <>
          <Web3Status />
        </> : null
      }
    </div>
  </>
}
export { SourceCard }