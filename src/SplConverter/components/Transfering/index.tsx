import { useEffect, useRef, useState } from 'react'

import Button from '@/common/Button'
import { useStatesContext } from '@/contexts/states'
import { ReactComponent as CloseIcon } from '@/assets/close.svg'
import { ReactComponent as DoneIcon } from '@/assets/done.svg'
import { ReactComponent as LoaderIcon } from '@/assets/loader.svg'
const { REACT_APP_NETWORK } = process.env

const ASSOC_TX_EXPLORERS = {
  'devnet': 'https://neonscan.org',
  'testnet': 'https://neonscan.org',
  'mainnet-beta': 'https://neonscan.org',
}

export const Transfering = () => {
  const { pending, solanaTransferSign, neonTransferSign, resetStates } = useStatesContext()
  const handleRepeatScript = () => {
    resetStates()
  }
  const [reset, setReset] = useState(false)
  const timeout = useRef(null)
  useEffect(() => {
    if (pending === false) return
    timeout.current = setTimeout(() => {
      setReset(true)
      timeout.current = null
    }, 30000)

    return () => (timeout.current = null)
  }, [pending])

  if (pending) {
    return (
      <div className='loader'>
        <div className='loader__icon'>
          <LoaderIcon />
        </div>
        <div className='loader__title'>Processing transaction</div>
        <div className='loader__summary'>
          Usually takes 1-30 seconds to complete,
          <br />
          don’t close browser window just yet
        </div>
        <div className='flex justify-center'>
          {reset ? (
            <Button className='mt-10 ml-4' onClick={handleRepeatScript}>
              Stop Processing
            </Button>
          ) : null}
        </div>
      </div>
    )
  } else if (solanaTransferSign || neonTransferSign) {
    return (
      <div className='flex flex-col items-center min-w-420px p-6 bg-white dark:bg-dark-600'>
        <CloseIcon
          className='self-end mb-10 cursor-pointer fill-black dark:fill-white'
          onClick={handleRepeatScript}
        />
        <DoneIcon className='mb-10' />
        <div className='font-medium text-xl mb-6'>Transfer complete</div>
        {neonTransferSign ? (
          <a
            href={`${ASSOC_TX_EXPLORERS[REACT_APP_NETWORK]}/tx/${neonTransferSign}?network=${REACT_APP_NETWORK}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-500 mb-4'
          >
            View on Neonscan
          </a>
        ) : null}
        {solanaTransferSign ? (
          <a
            href={`https://solscan.io/tx/${solanaTransferSign}?cluster=${REACT_APP_NETWORK}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-500'
          >
            View on Solana Explorer
          </a>
        ) : null}
      </div>
    )
  } else {
    return <></>
  }
}
