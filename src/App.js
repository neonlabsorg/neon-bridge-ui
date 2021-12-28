import './App.scss';
import Layout from './common/Layout'
import { SplConverter } from './SplConverter';
import { Web3ReactProvider } from '@web3-react/core'
import { ConnectionProvider } from './contexts/connection';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { useSolanaWallet } from './SplConverter/hooks/useSolanaWallet'
import { NotieProvider } from 'react-notie';
import 'react-notie/css/notie.css'
import Web3 from 'web3'
function getLibrary(provider) {
  return new Web3(provider)
}

function App() {
  const {wallets} = useSolanaWallet()
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ConnectionProvider>
        <WalletProvider wallets={wallets} autoConnect>
          <NotieProvider>
            <Layout className='flex flex-col w-full px-4'
              bodyClassName='flex flex-col justify-center'>
              <SplConverter />
            </Layout>
          </NotieProvider>
        </WalletProvider>
      </ConnectionProvider>
    </Web3ReactProvider>
  );
}

export default App
