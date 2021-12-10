import React from 'react'
import { useTokenList } from '../hooks/useTokenList'
import { shortenAddress } from '../../utils'
const TokenManager = ({onClose = () => {}, onChooseToken = () => {}}) => {
  const {list, error} = useTokenList()
  return <div className='flex flex-col overflow-y-auto flex-grow' style={{
    maxHeight: '70vh'
  }}>
    {list && !error && list.length ?
      list.map(token => {
        return <div key={token.symbol} className='flex w-full p-4 cursor-pointer hover:bg-purple-900 rounded-lg'
          onClick={() => {
            onChooseToken(token)
            onClose()
          }}>
          <div className='flex flex-col w-full'>
            <div className='text-lg font-bold mb-3'>{token.name}</div>
            <div className='flex'>
              <div className='w-1/2'>{shortenAddress(token.address)}</div>
              <div className='w-1/2'>{shortenAddress(token.address_spl)}</div>
            </div>
          </div>
        </div>
      })
    : 'No tokens have been provided'}
    {
      error ? <>Error getting token list</> : null
    }
  </div>
}
export default TokenManager