import { useWallet } from '@solana/wallet-adapter-react';
import { useWeb3React } from '@web3-react/core';
import { useConnection } from '@/contexts/connection';
import { useStatesContext } from '@/contexts/states';
import useTransactionHistory from '@/SplConverter/hooks/useTransactionHistory';
import { useTokensContext } from '@/contexts/tokens';
import { useNeonTransfer } from '@/SplConverter/hooks/transfering/neon-transfer';

export function useTransferring() {
  const connection = useConnection();
  const { setPending, setSolanaTransferSign, setNeonTransferSign, setError, setConfirmation } = useStatesContext();
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
      onSuccessSign: (signature, transactionHash) => {
        if (signature) {
          setSolanaTransferSign(signature);
        }
        if (transactionHash) {
          setNeonTransferSign(transactionHash);
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
