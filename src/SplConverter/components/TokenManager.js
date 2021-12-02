import React from 'react'
import { useTokenList } from '../hooks/useTokenList'
const TokenManager = ({onClose = () => {}, onChooseToken = () => {}}) => {
  const {list, error} = useTokenList()
  return <div className='flex flex-col overflow-y-auto flex-grow'>
    {list && !error && list.length ?
      list.map(token => {
        return <div key={token.symbol} className='flex w-full p-3 cursor-pointer hover:bg-purple-900 rounded-lg'
          onClick={() => {
            onChooseToken(token)
            onClose()
          }}>
          {token.name}
        </div>
      })
    : 'No tokens have been provided'}
    {
      error ? <>Error getting token list</> : null
    }
  </div>
}
export default TokenManager