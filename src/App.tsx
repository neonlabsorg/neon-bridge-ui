import { WalletProvider } from '@solana/wallet-adapter-react';
import { Web3ReactProvider } from '@web3-react/core';
import Web3 from 'web3';

import { ToastProvider } from '@/common/Notifications';
import Layout from './common/Layout/newIndex';
import { ConnectionProvider } from './contexts/connection';
import { StateProvider } from './contexts/states';
import { TokensProvider } from './contexts/tokens';
import { SplConverter } from './SplConverter/';
import TokenManager from './SplConverter/components/common/TokenManager';
import { useSolanaWallet } from './SplConverter/hooks/useSolanaWallet';
import './App.scss';

function getLibrary(provider) {
  return new Web3(provider);
}

function App() {
  const { wallets } = useSolanaWallet();

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ConnectionProvider>
        <WalletProvider wallets={wallets}>
          <TokensProvider>
            <StateProvider>
              <ToastProvider>
                <Layout className='flex flex-col w-full relative' bodyClassName='flex flex-col justify-center'>
                  <SplConverter />
                  <TokenManager />
                </Layout>
                <div id='modals' />
              </ToastProvider>
            </StateProvider>
          </TokensProvider>
        </WalletProvider>
      </ConnectionProvider>
    </Web3ReactProvider>
  );
}

export default App;
