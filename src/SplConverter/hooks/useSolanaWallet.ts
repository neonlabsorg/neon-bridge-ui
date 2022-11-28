import { useMemo } from 'react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

const useSolanaWallet = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return { wallets };
};

export { useSolanaWallet };
