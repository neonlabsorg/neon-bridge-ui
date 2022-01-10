import { useEffect, useState } from "react"
import TokenManager from './TokenManager'
import {ModalCaller} from '../../../common/Modal'
import { useTokenList } from '../../hooks/useTokenList'
import { ReactComponent as DropDownIcon } from '../../../assets/dropdown.svg'
import { useStatesContext } from "../../../contexts/states"

export const CurrencyInput = ({
  className = ''
}) => {
  const {list, error, loading} = useTokenList()
  const [inputAmount, setInputAmount] = useState('0.0')
  const {amount, setAmount, splToken, setSplToken} = useStatesContext()
  const setToken = (token) => setSplToken(token)
  const openManageTokenModal = () => {
    new ModalCaller({
      title: 'Choose token',
      bodyClass: 'max-h-3/4 overflow-auto',
      className: 'w-2/4 max-w-420px',
      children: <TokenManager
        activeToken={splToken}
        list={list} error={error} loading={loading}
        onChooseToken={(token) => {
          setToken(token)
        }}/>
    })
  }
  useEffect(() => {
    if (amount !== 0 && typeof amount === 'number') setInputAmount(`${amount}`)
  }, [amount])
  useEffect(() => {
    if (isNaN(inputAmount)) return
    setAmount(Number(inputAmount))
  }, [inputAmount, setAmount])
  return <div className={`inline-flex bg-light-gray px-6 ${className} items-center justify-between`}
    style={{height: '80px'}}>
    <div onClick={openManageTokenModal} className='flex-grow flex items-center text-lg py-6 cursor-pointer'>
      {splToken.name ? splToken.name : 'Select a token'}
      <DropDownIcon className='ml-3'/>
    </div>
    <input type='number'
      className='w-1/4 py-6 text-lg bg-transparent inline-flex border-none outline-none text-right flex-shrink'
      value={inputAmount}
      onChange={(e) => {
        setInputAmount(e.target.value)
      }}/>
  </div>
}