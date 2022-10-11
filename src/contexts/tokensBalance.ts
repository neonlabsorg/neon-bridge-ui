import { SPLToken } from '@/transfer/models';
import { PublicKey } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { NEON_TOKEN_MINT } from '@/transfer/data';
import { useWeb3React } from '@web3-react/core';
import { useMemo, useState } from 'react';
import { CHAIN_IDS } from '@/connectors';
import { splTokensList } from '@/contexts/data';
import { useNetworkType } from '@/SplConverter/hooks';
import { Curriencies, Direction } from '@/contexts/models';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@/contexts/connection';
import ERC20_ABI from '@/SplConverter/hooks/abi/ERC20ForSpl.json';

export const useTokenBalance = () => {
  const { publicKey } = useWallet();
  const { library, account } = useWeb3React();
  const { chainId } = useNetworkType();
  const connection = useConnection();
  const [tokens, setTokens] = useState<SPLToken[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const currentChain = useMemo(() => {
    if (Number.isNaN(chainId)) return CHAIN_IDS['devnet'];
    return chainId;
  }, [chainId]);

  const customTokens = useMemo<SPLToken[]>(() => {
    return splTokensList.map(m => {
      const item = Object.assign({}, m);
      item.chainId = currentChain;
      return item;
    });
  }, [currentChain]);

  const getTokensList = async (): Promise<{ tokens: SPLToken[] }> => {
    return fetch('https://raw.githubusercontent.com/neonlabsorg/token-list/main/tokenlist.json')
      .then(r => r.json());
  };

  const getSplBalance = async (token: SPLToken): Promise<number> => {
    const tokenMint = new PublicKey(token.address_spl);
    const tokenAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenMint,
      publicKey
    );
    const [balanceData] = await Promise.all([connection.getTokenAccountBalance(tokenAddress)]).catch(_ => ([null, undefined]));
    if (balanceData) {
      const { value } = balanceData;
      return value?.uiAmount ? value.uiAmount :
        typeof value === 'number' ? value / Math.pow(10, token.decimals) : 0;
    }
    return 0;
  };

  const getEthBalance = async (token: SPLToken): Promise<number> => {
    if (token.address_spl === NEON_TOKEN_MINT) {
      const balance = await library.eth.getBalance(account);
      return parseFloat((balance / Math.pow(10, token.decimals)).toFixed(4));
    }
    const tokenInstance = new library.eth.Contract(ERC20_ABI['abi'], token.address);
    const balance = await tokenInstance.methods.balanceOf(account).call();
    return parseFloat(balance) / Math.pow(10, token.decimals);
  };

  const requestBalance = async (token: SPLToken): Promise<Curriencies> => {
    const balance: Curriencies = { [Direction.solana]: 0, [Direction.neon]: 0 };
    try {
      if (publicKey) {
        balance[Direction.neon] = await getSplBalance(token);
      }
      if (account) {
        balance[Direction.solana] = await getEthBalance(token);
      }
    } catch (e) {
      console.warn(e);
    }
    console.log(balance);
    return balance;
  };

  const mergeTokenList = ({ tokens }: { tokens: SPLToken[] }) => {
    const allTokens = [...customTokens].concat(tokens);
    const result = [];
    for (const item of allTokens) {
      if (item.chainId === currentChain) {
        result.push(item);
      }
    }
    setTokens(result);
  };

  const updateTokensList = async (): Promise<void> => {
    setLoading(true);
    return getTokensList().then(mergeTokenList).finally(() => setLoading(false));
  };

  return { tokens, loading, requestBalance, getTokensList, updateTokensList };
};
