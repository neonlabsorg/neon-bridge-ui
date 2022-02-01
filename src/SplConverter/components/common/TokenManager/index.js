import React, { useMemo, useState } from 'react'
import { useTokensContext } from '../../../../contexts/tokens'
import { SearchInput } from './components/SearchInput'
import Modal from 'react-modal';
import { useStatesContext } from '../../../../contexts/states';
// import { shortenAddress } from '../../../utils'
import {ReactComponent as PhantomIcon} from '@/assets/phantom.svg'
import {ReactComponent as MetamaskIcon} from '@/assets/metamask.svg'
import {ReactComponent as LoaderIcon} from '@/assets/loader.svg'
import { useWeb3React } from '@web3-react/core';
import { useWallet } from '@solana/wallet-adapter-react';
Modal.setAppElement('#root')
const TokenRow = ({
  token = {
    logoURI: '',
    symbol: '',
    address: '',
    name: '',
    balances: {}
  },
  onClick = () => {}
}) => {
  const {account} = useWeb3React()
  const {publicKey} = useWallet()
  const {direction} = useStatesContext()
  const isDisabled = useMemo(() => {
    return (direction === 'neon' && !token.balances.sol) || (direction === 'solana' && !token.balances.eth)
    // eslint-disable-next-line
  }, [account, publicKey])
  return <div className={`
      flex px-6 py-2 justify-between 
      ${!isDisabled ? 'hover:bg-gray-100 cursor-pointer' : 'pointer-events-none'}
    `}
    onClick={onClick}>
    <div className='flex items-center w-1/2 pr-4'>
      <div className='w-1/3 pr-4'>
        <img src={token.logoURI} alt='token logo' />
      </div>
      <div className='w-2/3 flex flex-col'>
        <div className='text-lg mb-2'>{token.symbol}</div>
        <div className='text-sm text-gray-500'>{token.name}</div>
      </div>
    </div>
    <div className='w-1/2 pl-4 text-sm flex items-center justify-end'>
      <div className='flex flex-col items-end'>
      {Object.keys(token.balances).map(netKey => {
        const balance = token.balances[netKey]
        if (balance === undefined) return <></>
        if ((direction === 'neon' && publicKey && netKey === 'sol') || (direction === 'solana' && account && netKey === 'eth')) {
          return <div className='py-1 flex items-center' key={netKey}>
            <span className='mr-2'>{JSON.stringify(balance)}</span>
            {netKey === 'eth' ? <MetamaskIcon/> : <PhantomIcon/>}
          </div>
        }
        return <></>
      })}
      </div>
      
    </div>
  </div>
}

const TokenManager = () => {
  const {list, pending, error, tokenManagerOpened, setTokenManagerOpened} = useTokensContext()
  const {setSplToken} = useStatesContext()

  const [searchString, setSearchString] = useState('')
  const findBySearch = () => {
    const arr = []
    if (!searchString.length) return arr
    // founding string
    const fs = searchString.toLowerCase()
    list.forEach(item => {
      if (
        item.name.toLowerCase().includes(fs) ||
        item.symbol.toLowerCase().includes(fs) ||
        item.address.toLowerCase().includes(fs) ||
        item.address_spl.toLowerCase().includes(fs)
        ) {
        arr.push(item)
      }
    })
    return arr
  }
  const searchList = useMemo(findBySearch, [list, searchString]);
  
  return <div><Modal
    isOpen={tokenManagerOpened}
    className='modal'
    overlayClassName='modal-overlay'
    onRequestClose={() => setTokenManagerOpened(false)}>
    <SearchInput
      className='mx-4 mb-6'
      placeholder={'Choose or paste token'}
      value={searchString}
      onChange={setSearchString}/>
    <div className='flex-col overflow-y-auto border-t border-gray-300' style={{
      maxHeight: '50vh'
    }}>
    {list && !error && list.length && !pending && !searchString ?
      list.map(token => {
        return <TokenRow token={token} key={token.symbol} onClick={() => {
          setSplToken(token)
          setTokenManagerOpened(false)
        }}/>
      }) :
      searchString ?
        searchList.map((token) => {
          return <TokenRow token={token} key={token.symbol} onClick={() => {
            setSplToken(token)
            setTokenManagerOpened(false)
          }}/>
        }) :
        pending ?
          <div className='p-4 flex items-center'>
            <div className='loader-icon'><LoaderIcon/></div>
            <span className='ml-4 text-lg'>Updating token list, please wait...</span>
          </div> :
          error ?
            <div className='flex p-4 flex-col'>
              <div className='text-lg mb-4'>Error getting token list</div>
              <div className='text-gray-600'>{error}</div>
            </div>
        : list.length ? <>No tokens has been provided</> : null }
      </div>
  </Modal></div>
}
export default TokenManager