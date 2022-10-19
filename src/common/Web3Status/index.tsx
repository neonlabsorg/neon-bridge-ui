import { useCallback, useState } from 'react';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';

import { Dropdown } from '@/common/Dropdown';
import { injected } from '@/connectors';
import { shortenAddress } from '@/utils';

const Web3Status = ({ className = '' }) => {
  const [copied, setCopied] = useState(false);
  const { account, error, activate, deactivate, active } = useWeb3React();

  async function connect() {
    try {
      await activate(injected);
    } catch (ex) {
      console.log(ex);
    }
  }

  async function disconnect() {
    try {
      deactivate();
    } catch (ex) {
      console.log(ex);
    }
  }

  const copyAddress = useCallback(async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  }, [account]);

  if (error) {
    return <div>
      {error instanceof UnsupportedChainIdError ?
        <div className='flex flex-col py-4 px-6 border border-purple-700 mb-6'>
          <div className='text-md mb-3'>{'Wrong Network'}</div>
          <div className='flex flex-col text-sm text-gray-600'>
            {`Choose ${
              process.env.REACT_APP_NETWORK || 'Neon'
            } network in your metamask wallet to continue transaction`}
          </div>
        </div> : 'Error'}
    </div>;
  }
  if (active && account) {
    const triggerButton = <button className={`p-4 text-blue-600 cursor-pointer`}>
      {shortenAddress(account)}
    </button>;
    return <Dropdown className={className} trigger={triggerButton}>
      <div aria-label='dropdown-list' role='menu'>
        <button onClick={copyAddress} className='dropdown__item' role='menuitem'>
          {copied ? 'Copied' : 'Copy address'}
        </button>
        <button onClick={disconnect} className='dropdown__item' role='menuitem'>
          Disconnect
        </button>
      </div>
    </Dropdown>;
  } else {
    return <button onClick={connect} className={`p-4 text-blue-600 cursor-pointer ${className}`}>
      Connect Wallet
    </button>;
  }
};
export default Web3Status;
