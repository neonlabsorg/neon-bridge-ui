import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWeb3React } from '@web3-react/core';
import { SPLToken } from 'neon-portal';
import { useStatesContext } from '@/contexts/states';
import { useTokensContext } from '@/contexts/tokens';
import { ReactComponent as LoaderIcon } from '@/assets/loader.svg';
import { ReactComponent as MetamaskIcon } from '@/assets/metamask.svg';
import { ReactComponent as PhantomIcon } from '@/assets/phantom.svg';
import { Direction } from '@/contexts/models';
import { TokenSymbol } from './TokenSymbol';

export const TokenRow = (data: { token: SPLToken, balance: number, onClick: (e: any) => void }) => {
  const {
    token = {
      logoURI: '',
      symbol: '',
      address: '',
      address_spl: '',
      name: ''
    },
    onClick = () => {
    }
  } = data;
  const { account } = useWeb3React();
  const { publicKey } = useWallet();
  const { direction, theme } = useStatesContext();
  const { tokenErrors, balances } = useTokensContext();
  const balance = useMemo(() => balances[token.symbol], [token, balances]);
  const isDisabled = useMemo(() =>
      balance && ((direction === Direction.neon && !balance[Direction.neon]) || (direction === Direction.solana && !balance[Direction.solana])),
    [direction, balance]);
  const CoinIcon = useMemo(() => direction === Direction.solana ? MetamaskIcon : PhantomIcon, [direction]);

  const currencyBalance = useMemo(() => {
    if (balance) {
      return balance[direction];
    }
    return undefined;
  }, [balance, direction]);
  const tokenError = useMemo(() => tokenErrors[token.symbol], [tokenErrors, token]);

  const renderCurrencyBalance = useMemo(() => {
    if (tokenError && ((direction === 'neon' && tokenError.type === 'sol') || (direction === 'solana' && tokenError.type === 'eth'))) {
      return <div className={'py-1 text-red-400 text-xs'}>{tokenError.message}</div>;
    }
    if (currencyBalance === undefined) {
      return <div className='py-1 flex items-center'>
          <span className='mr-2'>
            <div className='loader-icon'>
              <LoaderIcon className='w-18px h-18px' />
            </div>
          </span>
        <CoinIcon />
      </div>;
    }
    if ((direction === Direction.neon && publicKey) || (direction === Direction.solana && account)) {
      return <div className='py-1 flex items-center'>
        <span className='mr-2'>{JSON.stringify(currencyBalance)}</span>
        <CoinIcon />
      </div>;
    }
    return <></>;
  }, [balance, direction, tokenError, account, publicKey]);

  const tokenClasses = useMemo(() => {
    const hover = isDisabled ? 'pointer-events-none opacity-70 transition ease-in-out delay-150' :
      `cursor-pointer hover:bg-gray-${theme === 'light' ? '100' : '600'}`;
    return `flex pl-4 pr-6 py-2 justify-between dark:text-white ${hover}`;
  }, [isDisabled, theme]);

  return <div className={tokenClasses} onClick={onClick}>
    <div className='flex items-center w-3/4 pr-2'>
      <div className='w-1/5 pr-2 text-center'>
        <TokenSymbol src={token.logoURI} alt={token.name} style={{ width: 36, height: 36 }} />
      </div>
      <div className='w-4/5 flex flex-col'>
        <div className='text-lg'>{token.symbol}</div>
        <div className='text-sm text-gray-500 leading-none'>{token.name}</div>
      </div>
    </div>
    <div className='w-1/4 pl-2 text-sm flex items-center justify-end'>
      <div className='flex flex-col items-end'>{renderCurrencyBalance}</div>
    </div>
  </div>;
};
