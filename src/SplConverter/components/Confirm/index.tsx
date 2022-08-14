import { useStatesContext } from '@/contexts/states'
import { useEffect } from 'react'
import { TransferInfo } from '@/SplConverter/components/common/TransferInfo'
import { ReactComponent as ArrowIcon } from '@/assets/arrow-right.svg'
import Button from '@/common/Button'
import { useTransfering } from '@/SplConverter/hooks/transfering'
import { ErrorHandler } from '@/SplConverter/components/common/ErrorHandler'
import { useToast } from '@/common/Notifications'

export const Confirm = () => {
  const { addToast } = useToast()
  const { amount, token, direction, error } = useStatesContext()
  const { deposit, withdraw } = useTransfering()
  const handleConfirmTransfer = () => {
    if (direction === 'neon') deposit(amount, token)
    if (direction === 'solana') withdraw(amount, token)
  }

  useEffect(() => {
    if (error !== undefined) addToast(error, 'ERROR')
    // eslint-disable-next-line
  }, [error])

  return (
    <div className='w-full flex flex-col pt-6'>
      <div className='flex flex-col items-center'>
        <img
          style={{
            width: '56px',
            height: '56px',
          }}
          src={token.logoURI}
          className='mb-4'
          alt={token.symbol}
        />
        <div className='text-2xl font-medium mb-8'>{`${amount} ${token.symbol}`}</div>
      </div>
      <div className='flex justify-between mb-8'>
        <div className='w-5/12 p-6 flex items-center justify-center bg-pinky-white border border-transparent dark:bg-dark-600 dark:border-op15-white'>
          {direction === 'neon' ? 'Solana' : 'Neon'}
        </div>
        <div className='w-1/6 flex items-center justify-center'>
          <ArrowIcon />
        </div>
        <div className='w-5/12 p-6 flex items-center justify-center bg-pinky-white border border-transparent dark:bg-dark-600 dark:border-op15-white'>
          {direction === 'neon' ? 'Neon' : 'Solana'}
        </div>
      </div>
      <TransferInfo className='mb-8' />
      <Button onClick={handleConfirmTransfer}>Confirm</Button>
      <ErrorHandler className='mt-8 text-red-500' />
    </div>
  )
}
