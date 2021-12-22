import CurrencySelect from '../../CurrencySelect'
import Input from '@/common/Input'
import Button from '@/common/Button'
import { useState } from 'react'
import { withNotie } from 'react-notie';
import { useTransfering } from '../../../hooks/transfering'

const NeonTransferer = ({onSignTransfer = () => {}, ...props}) => {
  const [targetToken, setTargetToken] = useState(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')


  const createNeonTransfer = useTransfering()
  const {alert} = props.notie
  const handleCreateTransfer = async () => {
    try {
      await createNeonTransfer(
        targetToken,
        Number(amount),
        (sig) => {
          onSignTransfer(sig, targetToken, Number(amount))
        },
        () => {
          alert({
            message: 'No accociated account was found on current metamask address. We will create new one for you.',
            level: 'INFO',
            ttl: 3000
          })
        }
      )
    } catch (err) {
      setError(err.message)
      console.warn(err)
      return
    }
  }
  return <>
    <div className='flex xs:flex-col mb-4'>
      <div className='sm:w-1/2 xs:w-full flex flex-col xs:mb-8'>
        <span className='mb-2'>Select a token</span>
        <CurrencySelect
          className='self-start'
          currency={targetToken}
          onChangeCurrency={(token) => setTargetToken(token)}/>
      </div>
      <div className='sm:w-1/2 xs:w-full flex flex-col'>
        <span className='mb-2'>Enter token amount</span>
        <div className='flex items-center'>
          <div className='flex flex-col'>
            <Input value={amount}
              type='number'
              className='mb-4'
              onChange={(value) => {
                setAmount(value)
              }}/>
          </div>
        </div>
      </div>
    </div>
    <Button
      disabled={amount <= 0 || !targetToken}
      onClick={handleCreateTransfer}>Apply transfer</Button>
    {/* <Button className='ml-2' onClick={createERC20AccountInstruction}>Create neon account instruction</Button> */}
    {error ? <div className='flex mt-8 p-3 text-red-400 rounded-lg'
      style={{
        maxWidth: '600px'
      }}>
      {error}
    </div> : null}
  </>
}

export default withNotie(NeonTransferer)