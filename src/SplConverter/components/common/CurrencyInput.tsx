import { useEffect, useState } from 'react';
import { useStatesContext } from '@/contexts/states';
import { useTokensContext } from '@/contexts/tokens';
import { escapeRegExp } from '@/utils';
import { ReactComponent as DropDownIcon } from '@/assets/dropdown.svg';

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);

export const CurrencyInput = ({ className = '' }) => {
  const [inputAmount, setInputAmount] = useState('0.0');
  const { setAmount, token, maxBalance } = useStatesContext();
  const { setTokenManagerOpened } = useTokensContext();

  useEffect(() => {
    const amount = Number(inputAmount);
    const isSafe = Number.isFinite(amount) && Number.isSafeInteger(amount * Math.pow(10, 9));
    if (isSafe) setAmount(amount);
  }, [inputAmount, setAmount]);

  useEffect(() => {
    setInputAmount('0.0');
  }, [token]);

  const enforcer = (nextUserInput: string): void => {
    const amount = Number(nextUserInput);
    const isSafe = Number.isFinite(amount) && Number.isSafeInteger(amount * Math.pow(10, 9));

    if (nextUserInput === '' || (inputRegex.test(escapeRegExp(nextUserInput)) && isSafe)) {
      setInputAmount(nextUserInput);
    }
  };

  const onChangeInput = (e) => enforcer(e.target.value.replace(/,/g, '.'));

  return <div
    className={`inline-flex bg-light-gray dark:bg-dark-500 px-4 items-center justify-between ${className}`}
    style={{ height: '80px' }}>
    <div className='flex flex-col justify-center'>
      <div onClick={() => setTokenManagerOpened(true)}
           className='flex-grow flex items-center text-lg cursor-pointer'>
        {token ? token.name : 'Select a token'}
        <DropDownIcon className='ml-2 svg-fill' />
      </div>
      {token && <div className='flex items-center'>
        <span className='text-sm text-grey'>{`Balance: ${maxBalance} ${token.symbol}`}</span>
        <span className='text-blue-main text-sm ml-2 p-1 cursor-pointer leading-none'
              onClick={() => setInputAmount(`${maxBalance}`)}> MAX</span>
      </div>}
    </div>
    <input
      className='w-1/3 py-6 text-lg bg-transparent inline-flex border-none outline-none text-right flex-shrink'
      value={inputAmount} maxLength={7} minLength={1} inputMode='decimal' autoComplete='off'
      autoCorrect='off' type='text' pattern='^[0-9]*[.,]?[0-9]*$' onChange={onChangeInput} />
  </div>;
};
