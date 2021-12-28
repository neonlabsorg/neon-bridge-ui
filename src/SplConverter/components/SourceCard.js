import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react';
import { useWeb3React } from '@web3-react/core';
import {ReactComponent as NeonIcon} from '@/assets/neon.svg'
import {ReactComponent as SolanaIcon} from '@/assets/solana.svg'
import Web3Status from '../../common/Web3Status'
import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { NetworkSelect } from './NetworkSelect';
import { useNetworkType } from '../hooks';

const SourceCard = ({sourceName = 'solana'}) => {
  const { active } = useWeb3React()
  const { network } = useNetworkType()
  const { publicKey } = useWallet()
  return <>
    <div className='flex items-center mb-6'>
      {sourceName === 'solana' ? 
        <>
          <SolanaIcon style={{
            maxWidth: '80px',
            maxHeight: '50px'
          }} />
          <span className='ml-4 text-3xl'>Solana</span>
        </>
      :
        <>
          <NeonIcon style={{
            maxWidth: '50px',
            maxHeight: '50px'
          }} />
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
    <div className='py-4 mb-4 flex flex-col items-start'>
      <span className='mb-4'>Network</span>
      {sourceName === 'solana' ? <NetworkSelect/> : <span className='uppercase'>{network}</span> }
    </div>
  </>
}
export { SourceCard }