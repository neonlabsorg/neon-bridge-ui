import {
  clusterApiUrl,
  Connection
} from '@solana/web3.js';
import { createContext, useMemo, useEffect, useContext } from 'react';
import { useNetworkType } from '../SplConverter/hooks';
import { useLocalStorageState } from '../utils';

export const ENDPOINTS = [
  {
    associatedChainId: 245022934,
    key: 'mainnet-beta',
    name: 'Solana Mainnet Beta',
    endpoint:  process.env.REACT_APP_MAINNET_RPC ||  'https://api.mainnet-beta.solana.com'
  },
  {
    associatedChainId: 245022940,
    key: 'testnet',
    name: 'Solana TestNet',
    endpoint: clusterApiUrl('testnet')
  },
  {
    associatedChainId: 245022926,
    key: 'devnet',
    name: 'Solana DevNet',
    endpoint: clusterApiUrl('devnet')
  }
  // {
  //   name: 'LocalNet',
  //   endpoint: 'http://127.0.0.1:8899'
  // },
];
const DEFAULT = ENDPOINTS[0].endpoint;
const DEFAULT_SLIPPAGE = 0.25;

const ConnectionContext = createContext({
  endpoint: DEFAULT,
  setEndpoint: () => {},
  slippage: DEFAULT_SLIPPAGE,
  setSlippage: () => {},
  connection: new Connection(DEFAULT, 'recent')
});

export function ConnectionProvider({ children = undefined}) {
  const {chainId} = useNetworkType()
  const endpoint = useMemo(() => {
    if (!chainId) return DEFAULT
    let endpointByChain;
    ENDPOINTS.forEach(item => {
      if (item.associatedChainId === chainId) endpointByChain = item.endpoint
    })
    return endpointByChain
  }, [chainId])
  const [slippage, setSlippage] = useLocalStorageState(
    'slippage',
    DEFAULT_SLIPPAGE.toString(),
  );

  const connection = useMemo(
    () => new Connection(endpoint, 'recent'),
    [endpoint],
  );

  useEffect(() => {
    const id = connection.onSlotChange(() => null);
    return () => {
      connection.removeSlotChangeListener(id);
    };
  }, [connection]);
  return (
    <ConnectionContext.Provider
      value={{
        endpoint,
        slippage: parseFloat(slippage),
        setSlippage: val => setSlippage(val.toString()),
        connection
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  return useContext(ConnectionContext).connection;
}

export function useConnectionConfig() {
  const context = useContext(ConnectionContext);
  return {
    endpoint: context.endpoint,
    setEndpoint: context.setEndpoint,
    connection: context.connection
  };
}