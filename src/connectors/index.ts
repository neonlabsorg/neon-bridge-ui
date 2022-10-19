import { InjectedConnector } from '@web3-react/injected-connector';

export const CHAIN_IDS = {
  'mainnet-beta': 245022934,
  'testnet': 245022940,
  'devnet': 245022926
};
export const injected = new InjectedConnector({
  supportedChainIds: [CHAIN_IDS[process.env.REACT_APP_NETWORK || 'mainnet-beta']]
});
