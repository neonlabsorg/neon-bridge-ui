import { useCallback, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWeb3React } from '@web3-react/core'

import { useStatesContext } from '@/contexts/states'
import { useTokensContext } from '@/contexts/tokens'
import { ReactComponent as LoaderIcon } from '@/assets/loader.svg'
import { ReactComponent as MetamaskIcon } from '@/assets/metamask.svg'
import { ReactComponent as PhantomIcon } from '@/assets/phantom.svg'
import { TokenSymbol } from './TokenSymbol'
export const TokenRow = ({
  token = {
    logoURI: '',
    symbol: '',
    address: '',
    name: '',
  },
  onClick = () => {},
}) => {
  const { account } = useWeb3React()
  const { publicKey } = useWallet()
  const { direction, theme } = useStatesContext()
  const { tokenErrors, balances } = useTokensContext()
  const balance = useMemo(() => {
    return balances[token.symbol]
  }, [token, balances])
  const activeNetkey = useMemo(() => {
    if (direction === 'neon') return 'sol'
    else return 'eth'
  }, [direction])
  const isDisabled = useMemo(
    () =>
      balance &&
      ((direction === 'neon' && !balance.sol) || (direction === 'solana' && !balance.eth)),
    [direction, balance],
  )
  const Icon = useMemo(() => {
    return activeNetkey === 'eth' ? MetamaskIcon : PhantomIcon
  }, [activeNetkey])
  const currencyBalance = useMemo(() => {
    if (balance === undefined) return undefined

    return balance[activeNetkey]
  }, [balance, activeNetkey])
  const tokenError = useMemo(() => tokenErrors[token.symbol], [tokenErrors, token])

  const renderCurrencyBalance = useCallback(() => {
    if (
      (direction === 'neon' && activeNetkey === 'eth') ||
      (direction === 'solana' && activeNetkey === 'sol')
    ) {
      return <></>
    }
    if (
      tokenError !== undefined &&
      ((direction === 'neon' && tokenError.type === 'sol') ||
        (direction === 'solana' && tokenError.type === 'eth'))
    ) {
      return <div className={'py-1 text-red-400 text-xs'}>{tokenError.message}</div>
    }
    if (currencyBalance === undefined) {
      return (
        <div className='py-1 flex items-center'>
          <span className='mr-2'>
            <div className='loader-icon'>
              <LoaderIcon className='w-18px h-18px' />
            </div>
          </span>
          <Icon />
        </div>
      )
    }
    if (
      (direction === 'neon' && publicKey && activeNetkey === 'sol') ||
      (direction === 'solana' && account && activeNetkey === 'eth')
    ) {
      return (
        <div className='py-1 flex items-center'>
          <span className='mr-2'>{JSON.stringify(currencyBalance)}</span>
          <Icon />
        </div>
      )
    }
  }, [currencyBalance, direction, activeNetkey, tokenError, account, publicKey])

  return (
    <div
      className={`
      flex px-6 py-2 justify-between dark:text-white
      ${
        !isDisabled
          ? `cursor-pointer
        ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-600'}  `
          : 'pointer-events-none'
      }
    `}
      onClick={onClick}
    >
      <div className='flex items-center w-1/2 pr-4'>
        <div className='w-1/3 pr-4'>
          <TokenSymbol src={token.logoURI} alt={token.name} />
        </div>
        <div className='w-2/3 flex flex-col'>
          <div className='text-lg mb-2'>{token.symbol}</div>
          <div className='text-sm text-gray-500'>{token.name}</div>
        </div>
      </div>
      <div className='w-1/2 pl-4 text-sm flex items-center justify-end'>
        <div className='flex flex-col items-end'>{renderCurrencyBalance()}</div>
      </div>
    </div>
  )
}
