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
    return <span>{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error'}</span>
  }
  if (active && account) {
    return <div className='flex items-center'>
      <span className='mr-2'>{shortenAddress(account)}</span>
      <Button onClick={disconnect}>Disconnect</Button>
    </div>
  } else {
    return <Button onClick={connect}>Connect Metamask</Button>
  }

}
export default Web3Status