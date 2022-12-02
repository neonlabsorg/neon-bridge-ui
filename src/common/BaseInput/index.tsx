import {ChangeEventHandler, ReactNode, useState} from "react";

interface BaseInputProps {
  disabled?: boolean
  label: string
  children?: ReactNode
  placeholder?: string
  onChange?: (str: string | number) => void,
  value?: string | number
  type?: 'string' | 'number'
}

export const BaseInput = (
  {
    children,
    disabled = false,
    label,
    placeholder = '0',
    onChange,
    type = 'string',
    value = ''
  }: BaseInputProps) => {
  const [focus, setFocus] = useState(false);

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
          onChange={(event) => onChange(event.target.value)}
          className='bg-transparent outline-none w-full placeholder-input-text-disabled'
          type="text"
        />
        <div className={`cursor-pointer select-none ${disabled && 'text-input-text-disabled cursor-not-allowed'}`}>max</div>
      </div>
      {children}
    </div>
  )
}

export default BaseInput
