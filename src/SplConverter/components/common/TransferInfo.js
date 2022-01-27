import { useStatesContext } from "../../../contexts/states"
export const TransferInfo = ({className = ''}) => {
  const { amount, splToken } = useStatesContext()
  return <div className={`w-full flex flex-col mb-8 ${className}`}>
  <div className='flex w-full justify-between mb-2'>
    <div>Expected Output</div>
    <div className='text-gray-500'>{`${amount} ${splToken.symbol}`}</div>
  </div>
  <div className='flex w-full justify-between'>
    <div>Network Fee</div>
    <div className='text-gray-500'>~$ 0.0005</div>
  </div>
</div>
}