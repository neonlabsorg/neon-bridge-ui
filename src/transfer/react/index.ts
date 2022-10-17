import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWeb3React } from '@web3-react/core';
import { Connection } from '@solana/web3.js';
import { TransactionConfig } from 'web3-core';
import { NeonProxyRpcApi } from '@/transfer/api/neon-proxy-rpc';
import { InstructionEvents, SPLToken } from '@/transfer/models';
import useProxyInfo from '@/transfer/hooks/status';
import { MintPortal, NeonPortal } from '../core';

const urls = JSON.parse(process.env.REACT_APP_URLS);

export const proxyApi = new NeonProxyRpcApi({
  solanaRpcApi: urls.solanaRpcApi,
  neonProxyRpcApi: urls.neonProxyRpcApi
});

export function useNeonTransfer(events: InstructionEvents, currentConnection: Connection) {
  const { connection } = useConnection();
  const { account, library } = useWeb3React();
  const { publicKey } = useWallet();
  const proxyStatus = useProxyInfo(proxyApi);
  const options = {
    solanaWalletAddress: publicKey,
    neonWalletAddress: account,
    web3: library,
    proxyApi: proxyApi,
    proxyStatus: proxyStatus,
    customConnection: currentConnection || connection
  };

  const neonPortal = new NeonPortal(options);
  const mintPortal = new MintPortal(options);

  const portalInstance = (addr: string) => {
    return proxyStatus.NEON_TOKEN_MINT === addr ? neonPortal : mintPortal;
  };

  const getEthereumTransactionParams = (amount: number, splToken: SPLToken): TransactionConfig => {
    const portal = portalInstance(splToken.address_spl);
    return portal.getEthereumTransactionParams.call(portal, amount, splToken);
  };

  const deposit = (amount: number, splToken: SPLToken): void => {
    const portal = portalInstance(splToken.address_spl);
    return portal.createNeonTransfer.call(portal, events, amount, splToken);
  };

  const withdraw = (amount: number, splToken: SPLToken): void => {
    const portal = portalInstance(splToken.address_spl);
    return portal.createSolanaTransfer.call(portal, events, amount, splToken);
  };

  return { deposit, withdraw, getEthereumTransactionParams, proxyStatus };
}
