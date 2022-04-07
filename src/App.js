import './App.scss';
import Layout from './common/Layout'
import { SplConverter } from './SplConverter';
import { Web3ReactProvider } from '@web3-react/core'
import { ConnectionProvider } from './contexts/connection';
import { StateProvider } from './contexts/states'
import { WalletProvider } from '@solana/wallet-adapter-react';
import { useSolanaWallet } from './SplConverter/hooks/useSolanaWallet'
import { ToastProvider } from '@/common/Notifications';
import Web3 from 'web3'
import { TokensProvider } from './contexts/tokens';
import IssueReporter from './SplConverter/components/IssueReporter';
import TokenManager from './SplConverter/components/common/TokenManager';
import ThemeSwitcher from './SplConverter/components/ThemeSwitcher';
function getLibrary(provider) {
  return new Web3(provider)
}

function App() {
  const {wallets} = useSolanaWallet()
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ConnectionProvider>
        <WalletProvider wallets={wallets}>
          <StateProvider>
            <ToastProvider>
              <Layout className='flex flex-col w-full px-4 relative'
                bodyClassName='flex flex-col justify-center'>
                  <TokensProvider>
                    <SplConverter />
                    <TokenManager />
                    <div className='absolute z-10 right-10 bottom-10 flex flex-col items-end'>
                      <ThemeSwitcher />
                      <IssueReporter className='mt-10' />
                    </div>
                  </TokensProvider>
              </Layout>
              <div id='modals'/>
            </ToastProvider>
          </StateProvider>
        </WalletProvider>
      </ConnectionProvider>
    </Web3ReactProvider>
  );
}

export default App
