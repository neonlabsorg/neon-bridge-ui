import { PublicKey } from "@solana/web3.js"

const Details = ({
  className = '',
  direction = 'neon',
  signedTransfer = {
    signature: '',
    fromPublicKey: new PublicKey(),
    toPublicKey: new PublicKey(),
    mintToken: {},
    amount: 0
  }
}) => {
  
  return <div className={`w-full ${className}`}>
    {signedTransfer && signedTransfer.signature ? 
    <div className='flex w-full flex-col'>
      <div className='flex'>
        <div className='w-1/4 p-3'>Signature</div>
        <div className='w-3/4 p-3 break-words'>{signedTransfer.signature}</div>
      </div>
      <div className='flex'>
        <div className='w-1/4 p-3'>Address from</div>
        <div className='w-3/4 p-3'>{signedTransfer.fromPublicKey.toBase58()}</div>
      </div>
      <div className='flex'>
        <div className='w-1/4 p-3'>Address to</div>
        <div className='w-3/4 p-3'>{signedTransfer.toPublicKey.toBase58()}</div>
      </div>
      <div className='flex'>
        <div className='w-1/4 p-3'>Transfer token</div>
        <div className='w-3/4 p-3'>{signedTransfer.mintToken ? signedTransfer.mintToken.name : 'not set'}</div>
      </div>
      <div className='flex'>
        <div className='w-1/4 p-3'>Token amount</div>
        <div className='w-3/4 p-3'>{signedTransfer.amount}</div>
      </div>
    </div>
  : <>{'There are no signed transactions on this session yet'}</>}
  </div>
}
export default Details