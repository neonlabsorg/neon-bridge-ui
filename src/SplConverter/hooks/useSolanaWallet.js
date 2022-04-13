import { useMemo } from 'react'
import {
  getPhantomWallet
} from '@solana/wallet-adapter-wallets';
const useSolanaWallet = () => {
  const wallets = useMemo(() => [
    getPhantomWallet()
  ], []);
  return { wallets }
}

const useWalletAdapters = () => {
  const { wallets } = useSolanaWallet()
  return wallets.map(({name, adapter}) => {
    const walletAdapter = adapter()
    return {name, walletAdapter}
  })
}

export { useSolanaWallet, useWalletAdapters }