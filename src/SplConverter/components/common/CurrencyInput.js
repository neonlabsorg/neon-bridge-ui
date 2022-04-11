import { useEffect, useState } from "react"
import { ReactComponent as DropDownIcon } from '../../../assets/dropdown.svg'
import { useStatesContext } from "../../../contexts/states"
import { useTokensContext } from "../../../contexts/tokens"

export const CurrencyInput = ({
  className = ''
}) => {
  const INVALID_CHARS = [
    "-",
    "+",
    "e",
  ];
  const [inputAmount, setInputAmount] = useState('0.0')
  const {amount, setAmount, token, maxBalance} = useStatesContext()
  const {setTokenManagerOpened} = useTokensContext()
  const openManageTokenModal = () => {
    setTokenManagerOpened(true)
  }
  useEffect(() => {
    if (amount !== 0 && typeof amount === 'number') setInputAmount(`${amount}`)
  }, [amount])
  useEffect(() => {
    let isValidSymbol = true
    for (let i = 0; i < inputAmount.length; i++) {
      const letter = inputAmount.charAt(i)
      if (INVALID_CHARS.includes(letter)) isValidSymbol = false
    }
    if (isNaN(inputAmount) || !isValidSymbol) {
      setInputAmount(amount)
      return
    }
    setAmount(Number(inputAmount))
  }, [inputAmount, setAmount])
  return <div className={`inline-flex bg-light-gray dark:bg-dark-500 px-6 ${className} items-center justify-between`}
    style={{height: '80px'}}>
    <div className="flex flex-col justify-center">
      <div onClick={openManageTokenModal} className='flex-grow flex items-center text-lg pb-1 cursor-pointer'>
        {token ? token.name : 'Select a token'}
        <DropDownIcon className='ml-3 svg-fill'/>
      </div>
      {token ? <div className="flex items-center pt-1">
        <span className='text-sm text-grey'>{`Balance: ${maxBalance} ${token.symbol}`}</span>
        <span className="text-blue-main text-sm ml-2 p-1 cursor-pointer"
          onClick={() => setInputAmount(`${maxBalance}`)}>MAX</span>
      </div>: null}
    </div>
    
    <input type='number'
      className='w-1/4 py-6 text-lg bg-transparent inline-flex border-none outline-none text-right flex-shrink'
      value={inputAmount}
      onChange={(e) => {
        setInputAmount(e.target.value)
      }}/>
  </div>
}