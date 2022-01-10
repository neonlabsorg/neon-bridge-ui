import React, { useMemo, useState } from 'react'
import { SearchInput } from './components/SearchInput'
// import { shortenAddress } from '../../../utils'

const TokenRow = ({
  token = {
    logoURI: '',
    symbol: '',
    address: '',
    name: '',
  },
  onClick = () => {}
}) => {
  return <div className='flex px-6 py-2 justify-between cursor-pointer hover:bg-gray-100' onClick={onClick}>
    <div className='flex items-center w-1/2'>
      <div className='w-1/3 pr-4'>
        <img src={token.logoURI} alt='token logo' />
      </div>
      <div className='w-2/3 flex flex-col'>
        <div className='text-lg mb-2'>{token.symbol}</div>
        <div className='text-sm text-gray-500'>{token.name}</div>
      </div>
    </div>
    <div className='w-1/3 text-sm'>{'balances will be coming soon'}</div>
  </div>
}

const TokenManager = ({list = [], loading = false, error = undefined, onClose = () => {}, onChooseToken = () => {}}) => {
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
  
  return <div className='flex flex-col overflow-y-auto flex-grow'>
    <SearchInput
      className='mx-4 mb-6'
      placeholder={'Choose or paste token'}
      value={searchString}
      onChange={setSearchString}/>
    <div className='flex-col overflow-y-auto border-t border-gray-300' style={{
      maxHeight: '50vh'
    }}>
    {list && !error && list.length && !loading && !searchString ?
      list.map(token => {
        return <TokenRow token={token} key={token.symbol} onClick={() => {
          onChooseToken(token)
          onClose()
        }}/>
      }) :
      searchString ?
        searchList.map((token) => {
          return <TokenRow token={token} key={token.symbol} onClick={() => {
            onChooseToken(token)
            onClose()
          }}/>
        }) :
        loading ?
          <div className='p-6'>Loading list...</div> :
          error ?
            <>Error getting token list</>
        : list.length ? <>No tokens has been provided</> : null }
      </div>
  </div>
}
export default TokenManager