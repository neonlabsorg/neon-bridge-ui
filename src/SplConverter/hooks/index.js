import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
export const ChainId = {
  111: 'LOCAL',
  245022926: 'NEONDEV',
  245022940: 'NEONTEST',
  245022934: 'NEONMAIN'
}

export function useNetworkType() {
  const {library, active} = useWeb3ReactCore()
  if (active) {
    return library?.network && library.network.chainId ? ChainId[library.network.chainId] : 'disconnected'
  } else {
    return 'disconnected'
  }
}
export function useActiveWeb3React() {
  const context = useWeb3ReactCore()
  const contextNetwork = useWeb3ReactCore('NETWORK')
  return context.active ? context : contextNetwork
}
