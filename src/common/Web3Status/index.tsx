import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { shortenAddress } from '../../utils'
import { injected } from '../../connectors'
import { Dropdown } from '../Dropdown'
import { useState, useCallback } from 'react'
const Web3Status = ({ className = '' }) => {
  const [copied, setCopied] = useState(false)
  const { account, error, activate, deactivate, active } = useWeb3React()
  async function connect() {
    try {
      await activate(injected)
    } catch (ex) {
      console.log(ex)
    }
  }

  async function disconnect() {
    try {
      deactivate()
    } catch (ex) {
      console.log(ex)
    }
  }
  const copyAddress = useCallback(async () => {
    if (account) {
      await navigator.clipboard.writeText(account)
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    }
  }, [account])
  if (error) {
    return (
      <span>
        {error instanceof UnsupportedChainIdError ? (
          <div className='flex flex-col py-4 px-6 border border-purple-700 mb-6'>
            <div className='text-md mb-3'>{'Wrong Network'}</div>
            <div className='flex flex-col text-sm text-gray-600'>
              {`Choose ${
                process.env.REACT_APP_NETWORK || 'Neon'
              } network in your metamask wallet to continue transaction`}
            </div>
          </div>
        ) : (
          'Error'
        )}
      </span>
    )
  }
  if (active && account) {
    return (
      <Dropdown
        className={className}
        trigger={
          <div className={`p-4 text-blue-600 cursor-pointer`}>{shortenAddress(account)}</div>
        }
      >
        <ul aria-label='dropdown-list' role='menu'>
          <li onClick={copyAddress} className='dropdown__item' role='menuitem'>
            {copied ? 'Copied' : 'Copy address'}
          </li>
          <li onClick={disconnect} className='dropdown__item' role='menuitem'>
            Disconnect
          </li>
        </ul>
      </Dropdown>
    )
  } else {
    return (
      <div className={`p-4 text-blue-600 cursor-pointer ${className}`} onClick={connect}>
        Connect Wallet
      </div>
    )
  }
}
export default Web3Status
