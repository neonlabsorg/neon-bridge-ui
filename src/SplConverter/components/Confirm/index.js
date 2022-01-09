import { useStatesContext } from "../../../contexts/states"

export const Confirm = () => {
  const { amount, splToken } = useStatesContext()
  return <div className='w-full flex flex-col pt-6'>
    <div className='flex flex-col items-center'>
      <img style={{
        width: '56px',
        height: '56px'
      }} src={splToken.logoURI} className='mb-4' alt={splToken.symbol}/>
      <div className='text-2xl font-medium'>
        {`${amount} ${splToken.symbol}`}
      </div>
    </div>
  </div>
} 