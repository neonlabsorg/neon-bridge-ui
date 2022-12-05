import {ChangeEvent, ReactNode, useEffect, useState} from "react";
import {escapeRegExp} from "@/utils";
import {useStatesContext} from "@/contexts/states";

interface BaseCurrencyInputProps {
  disabled?: boolean
  label: string
  children?: ReactNode
  placeholder?: string
  onChange?: (str: string | number) => void
  value?: string | number
  type?: 'string' | 'number'
  onMax?: () => void
}

export const BaseCurrencyInput = (
  {
    children,
    disabled = false,
    label,
    placeholder = '0',
  }: BaseCurrencyInputProps) => {
  const { setAmount, token, maxBalance } = useStatesContext();
  const [focus, setFocus] = useState(false);
  const [inputAmount, setInputAmount] = useState('0.0');

  useEffect(() => {
    const amount = Number(inputAmount);
    const isSafe = Number.isFinite(amount) && Number.isSafeInteger(amount * Math.pow(10, 9));
    if (isSafe) setAmount(amount);
  }, [inputAmount, setAmount]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextUserInput = event.target.value.replace(/,/g, '.')
    const amount = Number(nextUserInput);
    const isSafe = Number.isFinite(amount) && Number.isSafeInteger(amount * Math.pow(10, 9));
    const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);

    if (nextUserInput === '' || (inputRegex.test(escapeRegExp(nextUserInput)) && isSafe)) {
      setInputAmount(nextUserInput);
    }
  }

  useEffect(() => {
    setInputAmount('0.0');
  }, [token]);

  return (
    <div>
      <div className='mb-2 ml-4 text-light-grey tracking-tighten'>
        {label}
      </div>
      <div className={`flex
         px-4 py-5 rounded-[8px] border border-2 border-transparent
         bg-input-bg hover:bg-input-bg-hover ease-in duration-200
         w-full h-[66px] text-base-2
         ${ focus ? 'bg-input-bg-hover border-[#6516E1]' : '' }
         ${disabled && '!bg-input-bg-disabled'}
      `}>
        <input
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          pattern='^[0-9]*[.,]?[0-9]*$'
          onChange={handleChange}
          className='bg-transparent outline-none w-full placeholder-input-text-disabled'
          type="text"
          value={inputAmount}
        />
        <button
          onClick={() => {token ? setInputAmount(maxBalance) : ''}}
          className={`cursor-pointer select-none ${disabled && 'text-input-text-disabled cursor-not-allowed'}`}
        >
          max
        </button>
      </div>
      {children}
    </div>
  )
}

export default BaseCurrencyInput
