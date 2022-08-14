import { useWallet } from '@solana/wallet-adapter-react'
import { useWeb3React } from '@web3-react/core'

import Button from '@/common/Button'
import { WalletModalProvider, WalletMultiButton } from '@/common/SolanaStatus'
import Web3Status from '@/common/Web3Status'
import { useStatesContext } from '@/contexts/states'
import { SourceCard } from '@/SplConverter/components/common/SourceCard'
import { TransferInfo } from '@/SplConverter/components/common/TransferInfo'

export const Target = () => {
  const { direction, finishStep, depositFee, solBalance } = useStatesContext()
  const { active } = useWeb3React()
  const { publicKey } = useWallet()

  return (
    <div className='w-full flex flex-col'>
      <SourceCard direction={direction} prefix='To' className='mb-6' />
      {direction === 'solana' ? (
        <WalletModalProvider>
          <WalletMultiButton />
        </WalletModalProvider>
      ) : direction === 'neon' ? (
        <>
          <Web3Status className='mb-6 self-center' />
        </>
      ) : null}
      {active ? <TransferInfo /> : null}
      <Button
        disabled={
          (direction === 'neon' && !active && depositFee > solBalance) ||
          (direction === 'solana' && !publicKey)
        }
        onClick={() => finishStep('target')}
      >
        {'Next'}
      </Button>
    </div>
  )
}
