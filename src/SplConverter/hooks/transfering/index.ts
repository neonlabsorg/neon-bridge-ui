import { useWallet } from '@solana/wallet-adapter-react'
import { useWeb3React } from '@web3-react/core'
import { useNeonTransfer } from 'neon-portal/src/react'

import { useConnection } from '@/contexts/connection'
import { useStatesContext } from '@/contexts/states'
import useTransactionHistory from '@/SplConverter/hooks/useTransactionHistory'

export const useTransfering = () => {
  const { setPending, setSolanaTransferSign, setNeonTransferSign, setError } = useStatesContext()
  const { addTransaction } = useTransactionHistory()
  const connection = useConnection()
  const { publicKey } = useWallet()
  const { account } = useWeb3React()
  const { deposit, withdraw, getEthereumTransactionParams } = useNeonTransfer(
    {
      onBeforeCreateInstruction: () => {
        setPending(true)
      },
      onBeforeSignTransaction: () => {
        setPending(true)
      },
      onSuccessSign: (sig, txHash) => {
        if (sig) setSolanaTransferSign(sig)
        if (txHash) setNeonTransferSign(txHash)
        addTransaction({ from: publicKey.toBase58(), to: account })
        setPending(false)
      },
      onErrorSign: (e) => {
        setError(e.message)
        setPending(false)
      },
    },
    connection,
  )
  return { deposit, withdraw, getEthereumTransactionParams }
}
