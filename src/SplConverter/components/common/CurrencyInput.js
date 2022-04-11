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
  const {setAmount, token, maxBalance} = useStatesContext()
  const {setTokenManagerOpened} = useTokensContext()
  const openManageTokenModal = () => {
    setTokenManagerOpened(true)
  }
  // useEffect(() => {
  //   if (amount !== 0 && typeof amount === 'number') setInputAmount(`${amount}`)
  // }, [amount])


  useEffect(() => {
    const num = Number(inputAmount)
    if (Number.isFinite(num) && num <= Number.MAX_SAFE_INTEGER) {
      setAmount(num)
    }
  // eslint-disable-next-line 
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
      onKeyDown={(e) => {
        if (INVALID_CHARS.includes(e.key)) e.preventDefault()
      }}
      onChange={(e) => {
        setInputAmount(e.target.value)
      }}/>
  </div>
}