import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useMemo } from 'react'
import {
  getPhantomWallet
  // getSolletExtensionWallet,
  // getSolletWallet
} from '@solana/wallet-adapter-wallets';
const useSolanaWallet = () => {
  const network = process.env.NODE_ENV === 'production' ? WalletAdapterNetwork.Testnet : WalletAdapterNetwork.Devnet;
  const wallets = useMemo(() => [
    getPhantomWallet()
    // getSolletWallet({ network }),
    // getSolletExtensionWallet({ network }),
  ], []);
  return { wallets, network }
}

const useWalletAdapters = () => {
  const { wallets } = useSolanaWallet()
  return wallets.map(({name, adapter}) => {
    const walletAdapter = adapter()
    return {name, walletAdapter}
  })
}

export { useSolanaWallet, useWalletAdapters }