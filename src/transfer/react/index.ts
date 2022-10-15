import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWeb3React } from '@web3-react/core';
import { NeonProxy } from '@/api/proxy';
import { TransactionConfig } from 'web3-core';
import { MintPortal, NeonPortal } from '../core';
import { NEON_TOKEN_MINT } from '../data';
import { SPLToken } from '@/transfer/models';

const proxyApi = new NeonProxy({
  solanaRpcApi: 'https://api.devnet.solana.com',
  neonProxyRpcApi: 'https://proxy.devnet.neonlabs.org/solana'
});

export function useNeonTransfer(events, currentConnection) {
  const { connection } = useConnection();
  const { account, library } = useWeb3React();
  const { publicKey } = useWallet();
  const options = {
    solanaWalletAddress: publicKey,
    neonWalletAddress: account,
    web3: library,
    proxyApi: proxyApi,
    customConnection: currentConnection || connection
  };

  const neonPortal = new NeonPortal(options);
  const mintPortal = new MintPortal(options);

  const portalInstance = (addr: string) => NEON_TOKEN_MINT === addr ? neonPortal : mintPortal;

  const getEthereumTransactionParams = (amount: number, splToken: SPLToken): TransactionConfig => {
    const portal = portalInstance(splToken.address_spl);
    return portal.getEthereumTransactionParams.call(portal, amount, splToken);
  };

  const deposit = (amount: number, splToken: SPLToken): void => {
    console.log('deposit');
    const portal = portalInstance(splToken.address_spl);
    return portal.createNeonTransfer.call(portal, events, amount, splToken);
  };

  const withdraw = (amount: number, splToken: SPLToken): void => {
    console.log('withdraw');
    const portal = portalInstance(splToken.address_spl);
    return portal.createSolanaTransfer.call(portal, events, amount, splToken);
  };

  return { deposit, withdraw, getEthereumTransactionParams };
}
