import { useStatesContext } from '@/contexts/states';
import { Direction } from '@/contexts/models';
import { useMemo } from 'react';

export const TransferInfo = ({ className = '' }) => {
  const { direction, amount, token, depositFee, withdrawFee, solBalance } = useStatesContext();
  const amountToken = useMemo(() => {
    const decimals = token.decimals < 9 ? token.decimals : 9;
    return `${amount ? amount.toFixed(decimals).replace(/\.?0+$/, '') : 0} ${token?.symbol}`;
  }, [amount, token]);

  return <div className={`w-full flex flex-col mb-8 ${className}`}>
    <div className='flex w-full justify-between mb-2'>
      <div>Expected Output</div>
      <div className='text-gray-500'>{amountToken}</div>
    </div>
    <div className='flex w-full justify-between mb-2'>
      <div>Network Fee</div>
      <div className='text-gray-500 text-right'>
        {direction === Direction.neon ? `${depositFee} SOL` : `${withdrawFee} NEON`}
      </div>
    </div>
    {direction === Direction.neon && depositFee > solBalance ? (
      <div className='text-red-600 my-4'>
        You haven't got enough SOL tokens for paying transaction fee.
        <br /> Please refill your SOL balance
      </div>
    ) : null}
  </div>;
};
