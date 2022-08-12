import Button from '@/common/Button'
import { useMemo } from 'react'
import { SourceCard } from '../common/SourceCard'
import { ReactComponent as ReverseIcon } from '@/assets/reverse.svg'
import Web3Status from '@/common/Web3Status'
import { useWeb3React } from '@web3-react/core'
import { WalletModalProvider, WalletMultiButton } from '@/common/SolanaStatus'
import { CurrencyInput } from '../common/CurrencyInput'
import { useStatesContext } from '@/contexts/states'
import { useWallet } from '@solana/wallet-adapter-react'

export const Source = ({ className = '' }) => {
  const { direction, toggleDirection, finishStep, amount, token, maxBalance } = useStatesContext()
  const { connected } = useWallet()
  const { active } = useWeb3React()
  const enabled = useMemo(
    () => (direction === 'neon' && connected) || (direction === 'solana' && active),
    [active, connected, direction],
  )
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <div className='flex justify-between items-center mb-6'>
        <div className='sm:w-1/3 xs:w-full flex flex-col'>
          <SourceCard
            prefix='From'
            direction={direction === 'neon' ? 'solana' : direction === 'solana' ? 'neon' : 'solana'}
          />
        </div>
        <Button iconed gray onClick={toggleDirection}>
          <ReverseIcon />
        </Button>
        <div className='sm:w-1/3 xs:w-full flex flex-col'>
          <SourceCard direction={direction} prefix='To' />
        </div>
      </div>
      <div className='flex justify-center'>
        {direction === 'neon' ? (
          <WalletModalProvider>
            <WalletMultiButton />
          </WalletModalProvider>
        ) : direction === 'solana' ? (
          <>
            <Web3Status className='mb-6' />
          </>
        ) : null}
      </div>
      {enabled ? <CurrencyInput className='mb-2' /> : null}
      <Button
        disabled={!enabled || amount === 0 || amount > maxBalance || !token}
        onClick={() => finishStep('source')}
      >
        Next
      </Button>
    </div>
  )
}
