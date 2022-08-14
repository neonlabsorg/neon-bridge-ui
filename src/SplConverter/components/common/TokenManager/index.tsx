import { useMemo, useState } from 'react'
import Modal from 'react-modal'

import Button from '@/common/Button'
import { useStatesContext } from '@/contexts/states'
import { useTokensContext } from '@/contexts/tokens'
import { ReactComponent as LoaderIcon } from '@/assets/loader.svg'
import { SearchInput } from './components/SearchInput'
import { TokenRow } from './components/TokenRow'
Modal.setAppElement('#root')

export const TokenManager = () => {
  const { list, pending, error, tokenManagerOpened, setTokenManagerOpened, refreshTokenList } =
    useTokensContext()
  const { setToken, theme } = useStatesContext()

  const [searchString, setSearchString] = useState('')
  const findBySearch = () => {
    const arr = []
    if (!searchString.length) return arr
    const fs = searchString.toLowerCase()
    list.forEach((item) => {
      if (
        item.name.toLowerCase().includes(fs) ||
        item.symbol.toLowerCase().includes(fs) ||
        item.address.toLowerCase() === fs ||
        item.address_spl.toLowerCase() === fs
      ) {
        arr.push(item)
      }
    })
    return arr
  }
  const searchList = useMemo(findBySearch, [list, searchString])

  return (
    <div>
      <Modal
        isOpen={tokenManagerOpened}
        className='modal'
        overlayClassName='modal-overlay'
        onRequestClose={() => setTokenManagerOpened(false)}
      >
        <SearchInput
          className='mx-4 mb-6'
          placeholder={'Choose or paste token'}
          value={searchString}
          onChange={setSearchString}
        />
        <div
          className={`flex-col overflow-y-auto ${
            theme === 'light' ? 'border-gray-300' : 'border-dark-600'
          } border-t`}
          style={{
            maxHeight: '50vh',
          }}
        >
          {list && !error && list.length && !pending && !searchString ? (
            list.map((token) => {
              return (
                <TokenRow
                  token={token}
                  key={token.name}
                  onClick={() => {
                    setToken(token)
                    setTokenManagerOpened(false)
                  }}
                />
              )
            })
          ) : searchString ? (
            searchList.map((token) => {
              return (
                <TokenRow
                  token={token}
                  key={token.symbol}
                  onClick={() => {
                    setToken(token)
                    setTokenManagerOpened(false)
                  }}
                />
              )
            })
          ) : pending ? (
            <div className='p-4 flex items-center'>
              <div className='loader-icon'>
                <LoaderIcon />
              </div>
              <span className='ml-4 text-lg'>Updating token list, please wait...</span>
            </div>
          ) : error ? (
            <div className='flex p-4 flex-col'>
              <div className='text-lg mb-4'>Error getting token list</div>
              <div className='text-gray-600'>{error}</div>
            </div>
          ) : list.length ? (
            <>No tokens has been provided</>
          ) : null}
        </div>
        <Button className='mx-4 mt-6 mb-4' onClick={() => refreshTokenList()}>
          Update List
        </Button>
      </Modal>
    </div>
  )
}
export default TokenManager
