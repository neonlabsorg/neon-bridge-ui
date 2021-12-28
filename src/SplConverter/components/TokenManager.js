import React from 'react'

import { shortenAddress } from '../../utils'
const TokenManager = ({list = [], loading = false, error = undefined, onClose = () => {}, onChooseToken = () => {}}) => {
  return <div className='flex flex-col overflow-y-auto flex-grow' style={{
    maxHeight: '70vh'
  }}>
    
    {list && !error && list.length && !loading ?
      list.map(token => {
        return <div key={token.address_spl} className='flex w-full p-4 cursor-pointer hover:bg-purple-900 rounded-lg'
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
    : loading ?
      <div>Loading list...</div>
      : error ? <>Error getting token list</>
      : list.length ? <>No tokens has been provided</> : null }
  </div>
}
export default TokenManager