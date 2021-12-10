const SignedTransactionAlert = ({signature = ''}) => {
  return <div className={'flex flex-col'}>
    <div className='text-lg mb-6'>Your transfer was sucessfully signed</div>
    <div className='mb-4'>Transaction signature:</div>
    <div className=' break-words'>{signature}</div>
  </div>
}

export default SignedTransactionAlert