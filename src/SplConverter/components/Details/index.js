import NeonTransferer from "./children/NeonTransferer"

const Details = ({
  className = '',
  direction = 'neon'
}) => {
  
  return <div className={`w-full p-3 ${className}`}>
    {direction === 'neon' ? <NeonTransferer/> : <>Transfer to Solana will be coming soon</>}
  </div>
}
export default Details