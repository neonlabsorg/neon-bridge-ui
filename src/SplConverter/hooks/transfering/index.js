import { useWallet } from '@solana/wallet-adapter-react'
import { useWeb3React } from '@web3-react/core'
import { useStatesContext } from '../../../contexts/states'
import { useNeonTransfer } from '../../vendor'
import useTransactionHistory from '../useTransactionHistory'

export const useTransfering = () => {
  const {setPending, setTransfering, rejected, setSolanaTransferSign, setError} = useStatesContext()
  const {addTransaction} = useTransactionHistory()
  const {publicKey} = useWallet()
  const {account} = useWeb3React()
  const { createNeonTransfer, createSolanaTransfer } = useNeonTransfer({
    onBeforeCreateInstruction: () => {
      console.log(this)
      setPending(true)
    },
    onBeforeSignTransaction: () => {
      if (rejected.current === true) {
        setPending(false)
        rejected.current = false
        return
      }
      setTransfering(true)
    },
    onSuccessSign: (sig, txHash) => {
      setSolanaTransferSign(sig, txHash)
      setTransfering(false)
      addTransaction({from: publicKey.toBase58(), to: account})
      setPending(false)
    },
    onErrorSign: (e) => {
      setError(e.message)
      setTransfering(false)
      setPending(false)
    }
  })
  return { createNeonTransfer, createSolanaTransfer }
}

