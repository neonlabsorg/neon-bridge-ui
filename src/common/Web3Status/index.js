import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { shortenAddress } from '../../utils'
import Button from '../Button'
import { injected } from '../../connectors'
const Web3Status = () => {
  const { account, error, activate, deactivate, active } = useWeb3React()
  async function connect() {
    try {
      await activate(injected)
    } catch (ex) {
      console.log(ex)
    }
  }

  async function disconnect() {
    try {
      deactivate()
    } catch (ex) {
      console.log(ex)
    }
  }
  if (error) {
    return <span>
      {error instanceof UnsupportedChainIdError ? 
      <div className='flex flex-col'>
        <div className='text-lg mb-1'>{'Wrong Network'}</div>
        <div className='flex flex-col'>
          <span>It seems your network settings configured wrong.</span>
          <a href='https://docs.neon-labs.org/docs/devportal/metamask_setup'
            className='underline'
            target='_blank' rel='noopener noreferrer'>
            Check out our docs to avoid this error.</a>
        </div>
      </div>
      : 'Error'}
    </span>
  }
  if (active && account) {
    return <div className='flex items-center'>
      <Button onClick={disconnect}>{shortenAddress(account)}</Button>
    </div>
  } else {
    return <Button onClick={connect}>Connect Metamask</Button>
  }

}
export default Web3Status