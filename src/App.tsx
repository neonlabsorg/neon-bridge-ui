import { WalletProvider } from '@solana/wallet-adapter-react'
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'

import { ToastProvider } from '@/common/Notifications'
import Layout from './common/Layout'
import { ConnectionProvider } from './contexts/connection'
import { StateProvider } from './contexts/states'
import { TokensProvider } from './contexts/tokens'
import { SplConverter } from './SplConverter'
import TokenManager from './SplConverter/components/common/TokenManager'
import IssueReporter from './SplConverter/components/IssueReporter'
import ThemeSwitcher from './SplConverter/components/ThemeSwitcher'
import { useSolanaWallet } from './SplConverter/hooks/useSolanaWallet'
import './App.scss'

function getLibrary(provider) {
  return new Web3(provider)
}

function App() {
  const { wallets } = useSolanaWallet()

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ConnectionProvider>
        <WalletProvider wallets={wallets}>
          <TokensProvider>
            <StateProvider>
              <ToastProvider>
                <Layout
                  className='flex flex-col w-full px-4 relative'
                  bodyClassName='flex flex-col justify-center'
                >
                  <SplConverter />
                  <TokenManager />
                  <div className='absolute z-10 right-10 bottom-10 flex flex-col items-end'>
                    <ThemeSwitcher />
                    <IssueReporter className='mt-10' />
                  </div>
                </Layout>
                <div id='modals' />
              </ToastProvider>
            </StateProvider>
          </TokensProvider>
        </WalletProvider>
      </ConnectionProvider>
    </Web3ReactProvider>
  )
}

export default App
