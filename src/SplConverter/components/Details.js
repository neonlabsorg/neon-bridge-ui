import CurrencySelect from './CurrencySelect'
import Input from '../../common/Input'
import Button from '../../common/Button'
import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react';
import { useWeb3React } from '@web3-react/core'

const Details = ({
  className = ''
}) => {
  const [targetToken, setTargetToken] = useState(null)
  const [solanaBalance, setSolanaBalance] = useState(0)
  const [amount, setAmount] = useState(0)
  const { publicKey } = useWallet()
  const { account } = useWeb3React()
  const { connection } = useConnection()

  useEffect(() => {
      if (!connection || !publicKey) return;
      connection.getBalance(publicKey)
        .then(value => {
          const lamports = value,
            lamportBySol = 0.0000000001
            setSolanaBalance(lamports * lamportBySol)
        }).catch(err => {
          console.warn(err)
        })
    }, [connection, publicKey])
  const createTransfer = () => {
    const params = {
      to: account,
      from: publicKey.toBase58(),
      value: amount
    }
    window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [params]
    }).then(txHash => {
      console.log(txHash)
    }).catch(err => {
      console.warn(err)
    })
  }
  return <div className={`w-full p-3 ${className}`}>
    <div className='flex mb-4'>
      <div className='w-1/2 flex flex-col'>
        <span className='text-lg mb-4'>Source</span>
        <span className='mb-2'>Enter solana token amount</span>
        <div v-if={solanaBalance} className='flex items-center'>
          <div className='flex flex-col'>
            <Input value={amount}
              type='number'
              className='mb-4'
              error={amount > solanaBalance}
              onChange={(value) => {
                setAmount(Number(value))
              }}/>
              {amount > solanaBalance ? <span className='text-red-400'>{`Max balance: ${solanaBalance} SOL`}</span> : null }
          </div>
        </div>
      </div>
      <div className='w-1/2 flex flex-col'>
        <span className='text-lg mb-4'>Target</span>
        <span className='mb-2'>Choose token transfer to</span>
        <CurrencySelect className='self-start' currency={targetToken} onChangeCurrency={(token) => setTargetToken(token)}/>
      </div>
    </div>
    <Button disabled={amount <= 0 || amount > solanaBalance || !targetToken}
      onClick={createTransfer}>Transfer</Button>
  </div>
}
export default Details