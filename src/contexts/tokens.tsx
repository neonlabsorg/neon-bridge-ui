import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useWeb3React } from '@web3-react/core';

import { CHAIN_IDS } from '@/connectors';
import { useNetworkType } from '@/SplConverter/hooks';
import ERC20_ABI from '@/SplConverter/hooks/abi/ERC20ForSpl.json';
import { usePrevious } from '@/utils';
import { useConnection } from './connection';
import { splTokensList } from '@/contexts/data';
import { NEON_TOKEN_MINT } from '@/transfer/data';
import { Direction } from '@/contexts/models';

export const TokensContext = createContext({
  list: [],
  tokenErrors: {},
  pending: false,
  tokenManagerOpened: false,
  setTokenManagerOpened: () => {
  },
  refreshTokenList: () => {
  }
});

export function TokensProvider({ children = undefined }) {
  const { chainId } = useNetworkType();
  const currentChainId = useMemo(() => {
    if (Number.isNaN(chainId)) {
      return CHAIN_IDS['devnet'];
    }
    return chainId;
  }, [chainId]);
  const initialTokenListState = useMemo(() => {
    return splTokensList.map(item => {
      item.chainId = currentChainId;
      return item;
    });
  }, [currentChainId]);
  const { publicKey } = useWallet();
  const { library, account } = useWeb3React();
  const prevAccountState = usePrevious(account);
  const prevPublicKeyState = usePrevious(publicKey);
  const connection = useConnection();
  const [list, setTokenList] = useState(initialTokenListState);
  const [pending, setPending] = useState(false);
  const [tokenManagerOpened, setTokenManagerOpened] = useState(false);

  const [error, setError] = useState('');

  const [tokenErrors, setTokenErrors] = useState({});

  const [balances, setBalances] = useState({});
  const addBalance = (symbol, balance) => {
    balances[symbol] = balance;
    setBalances({ ...balances });
  };

  const timeout = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const getSplBalance = async (token) => {
    const pubkey = new PublicKey(token.address_spl);
    const assocTokenAccountAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      pubkey,
      publicKey
    );
    const completed = await Promise.all([
      connection.getTokenAccountBalance(assocTokenAccountAddress),
      timeout(500)
    ]).catch((e) => {
      // console.warn(e);
      return [0, undefined];
    });
    const balanceData = completed[0];
    if (balanceData === 0) return 0;
    // @ts-ignore
    if (balanceData && balanceData.value) {
      // @ts-ignore
      return typeof balanceData.value === 'object' && balanceData.value.uiAmount
        ? // @ts-ignore
        balanceData.value.uiAmount
        : // @ts-ignore
        typeof balanceData.value === 'number'
          ? // @ts-ignore
          balanceData.value / Math.pow(10, token.decimals)
          : 0;
    }

    return 0;
  };

  const getEthBalance = async (token) => {
    if (token.address_spl === NEON_TOKEN_MINT) {
      const balance = await library.eth.getBalance(account);
      console.log(balance);
      return +(balance / Math.pow(10, token.decimals)).toFixed(4);
    }

    const tokenInstance = new library.eth.Contract(ERC20_ABI['abi'], token.address);
    const balance = await tokenInstance.methods.balanceOf(account).call();
    return balance / Math.pow(10, token.decimals);
  };

  const requestListBalances = async () => {
    for (const item of list) {
      let currencies = { [Direction.neon]: undefined, [Direction.solana]: undefined };
      try {
        if (publicKey) {
          currencies[Direction.neon] = await getSplBalance(item);
        }
        if (account) {
          currencies[Direction.solana] = await getEthBalance(item);
        }
        setTimeout(() => addBalance(item.symbol, currencies));
      } catch (e) {
        console.warn(e);
      }
    }
  };

  useEffect(() => {
    if (list) requestListBalances();
    else setBalances({});
    // eslint-disable-next-line
  }, [list]);

  const mergeTokenList = async (source = []) => {
    const fullList = [...initialTokenListState].concat(source);
    const newList = fullList.filter((item) => item.chainId === currentChainId);
    setTokenList(newList);
  };

  const refreshTokenList = async () => {
    await Promise.all([setTokenList(initialTokenListState), timeout(20), updateTokenList()]).catch(
      (e) => {
        console.warn(e);

        return e;
      }
    );
  };

  const updateTokenList = () => {
    setTokenErrors({});
    setPending(true);
    fetch('https://raw.githubusercontent.com/neonlabsorg/token-list/develop/tokenlist.json')
      .then((resp) => {
        if (resp.ok) {
          resp.json().then((data) => mergeTokenList(data.tokens)).catch((err) => setError(err.message));
        }
      })
      .catch((err) => {
        setError(`Failed to fetch neon transfer token list: ${err.message}`);
      })
      .finally(() => setPending(false));
  };

  useEffect(() => {
    if ((account && !prevAccountState) || (publicKey && !prevPublicKeyState)) {
      updateTokenList();
    } else {
      setTokenList(initialTokenListState);
    }
    // eslint-disable-next-line
  }, [account, publicKey]);

  return (
    <TokensContext.Provider
      value={{
        list,
        pending,
        error,
        tokenErrors,
        balances,
        tokenManagerOpened,
        // @ts-ignore
        setTokenManagerOpened,
        refreshTokenList
      }}
    >
      {children}
    </TokensContext.Provider>
  );
}

export function useTokensContext(): any {
  return useContext(TokensContext);
}
