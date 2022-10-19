import { useCallback, useMemo, useState } from 'react';
import Modal from 'react-modal';
import Button from '@/common/Button';
import { useStatesContext } from '@/contexts/states';
import { useTokensContext } from '@/contexts/tokens';
import { ReactComponent as LoaderIcon } from '@/assets/loader.svg';
import { SearchInput } from './components/SearchInput';
import { TokenRow } from './components/TokenRow';
import { SPLToken } from 'neon-portal';

Modal.setAppElement('#root');

export const TokenManager = () => {
  const {
    list, pending, error, tokenManagerOpened,
    setTokenManagerOpened, refreshTokenList, balances
  } = useTokensContext();
  const { setToken, theme, direction } = useStatesContext();
  const [searchString, setSearchString] = useState('');

  const isSPLToken = ({ name, symbol, address, address_spl }, search: string) => {
    const fs = search.toLowerCase();
    return name.toLowerCase().includes(fs) ||
      symbol.toLowerCase().includes(fs) ||
      address.toLowerCase() === fs ||
      address_spl.toLowerCase() === fs;
  };

  const filterList = useMemo<SPLToken[]>(() => {
    return searchString.length ? list.filter(item => isSPLToken(item, searchString)) : list;
  }, [list, searchString]);

  const tokenSelect = (token: SPLToken) => {
    setToken(token);
    setTokenManagerOpened(false);
  };

  const currencyBalance = useCallback((token: SPLToken): number => {
    if (balances instanceof Map && balances.has(token.address_spl)) {
      const balance = balances.get(token.address_spl);
      return balance[direction];
    }
    return null;
  }, [direction, balances]);

  const getTheme = useMemo(() => {
    return theme === 'light' ? 'border-gray-300' : 'border-dark-600';
  }, [theme]);

  return <Modal isOpen={tokenManagerOpened} className='modal' overlayClassName='modal-overlay'
                onRequestClose={() => setTokenManagerOpened(false)}>
    <div className={'p-4'}>
      <SearchInput value={searchString} onChange={setSearchString} className={'w-full'}
                   placeholder={'Choose or paste token'} />
    </div>
    <div className={`flex-col overflow-y-auto ${getTheme} border-t`}
         style={{ maxHeight: '50vh' }}>
      {filterList.length && !error && !pending ?
        filterList.map((token) =>
          <TokenRow token={token} key={token.address} onClick={() => tokenSelect(token)}
                    balance={currencyBalance(token)} />) :
        pending ?
          <div className='p-4 flex items-center'>
            <div className='loader-icon'><LoaderIcon /></div>
            <span className='ml-4 text-lg'>Updating token list, please wait...</span>
          </div> :
          error ? <div className='flex p-4 flex-col'>
              <div className='text-lg mb-4'>Error getting token list</div>
              <div className='text-gray-600'>{error}</div>
            </div> :
            filterList.length === 0 ?
              <div className={'p-4 items-center text-center'}>
                No tokens has been provided
              </div> : null}
    </div>
    <div className={'p-4 border-t'}>
      <Button className={'block w-full'} onClick={refreshTokenList}>Update List</Button>
    </div>
  </Modal>;
};
export default TokenManager;
