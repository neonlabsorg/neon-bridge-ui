import {
  clusterApiUrl,
  Connection
} from '@solana/web3.js';
import { createContext, useMemo, useEffect, useContext } from 'react';
import { useLocalStorageState } from '../utils';

export const ENDPOINTS = [
  {
    name: 'mainnet-beta',
    endpoint:  process.env.REACT_APP_MAINNET_RPC ||  'https://api.mainnet-beta.solana.com'
  },
  {
    name: 'testnet',
    endpoint: clusterApiUrl('testnet')
  },
  {
    name: 'devnet',
    endpoint: process.env.REACT_APP_DEVNET_RPC ||  'https://api.devnet.solana.com'
  },
  {
    name: 'localnet',
    endpoint: 'http://127.0.0.1:8899'
  },
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
  const [endpoint, setEndpoint] = useLocalStorageState(
    'connectionEndpoint',
    ENDPOINTS[0].endpoint,
  );

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
        setEndpoint,
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