import { useWallet } from '@solana/wallet-adapter-react';
import { useWeb3React } from '@web3-react/core';
import { useNeonTransfer } from 'neon-portal/dist';
import { useConnection } from '@/contexts/connection';
import { useStatesContext } from '@/contexts/states';
import useTransactionHistory from '@/SplConverter/hooks/useTransactionHistory';
import { useTokensContext } from '@/contexts/tokens';

export function useTransfering() {
  const connection = useConnection();
  const { setPending, setSolanaTransferSign, setNeonTransferSign, setError } = useStatesContext();
  const { addTransaction } = useTransactionHistory();
  const { refreshTokenList } = useTokensContext();
  const { publicKey } = useWallet();
  const { account, library } = useWeb3React();
  const { deposit, withdraw, getEthereumTransactionParams } = useNeonTransfer({
      onBeforeCreateInstruction: () => {
        setPending(true);
      },
      onBeforeSignTransaction: () => {
        setPending(true);
      },
      onSuccessSign: (sig, txHash) => {
        if (sig) {
          setSolanaTransferSign(sig);
        }
        if (txHash) {
          setNeonTransferSign(txHash);
        }
        addTransaction({ from: publicKey.toBase58(), to: account });
        setPending(false);
        refreshTokenList();
      },
      onErrorSign: (e) => {
        setError(e.message);
        setPending(false);
      }
    },
    connection,
    library,
    publicKey,
    account
  );

  return { deposit, withdraw, getEthereumTransactionParams };
}
