import { useWallet } from "@solana/wallet-adapter-react";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState, useMemo, createContext, useContext } from "react";
import { useNetworkType } from "../SplConverter/hooks";
import { useConnection } from "./connection";
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from '@solana/web3.js'
import ERC20_ABI from '../SplConverter/hooks/abi/erc20.json'

export const TokensContext = createContext({
  list: [],
  error: '',
  pending: false,
  tokenManagerOpened: false,
  setTokenManagerOpened: () => {}
});

export function TokensProvider({ children = undefined}) {
  const {chainId} = useNetworkType()
  const {publicKey} = useWallet()
  const {library, account} = useWeb3React()
  const connection = useConnection()
  const [error, setError] = useState('')
  const [sourceList, setSourceList] = useState([])
  const [pending, setPending] = useState(false)
  const [tokenManagerOpened, setTokenManagerOpened] = useState(false)

  const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const getSplBalance = async (token) => {
    const pubkey = new PublicKey(token.address_spl)
    const assocTokenAccountAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      pubkey,
      publicKey
    )
    const completed = await Promise.all([
      connection.getTokenAccountBalance(assocTokenAccountAddress),
      timeout(500)
    ]).catch(error => {
      console.warn(error.message)
      return [0, undefined]
    })
    const balanceData = completed[0]
    if (balanceData === 0) return 0
    if (balanceData && balanceData.value && balanceData.value.uiAmount) {
      return balanceData.value.uiAmount
    }
    return 0
  }


  const getEthBalance = async (token) => {
    const tokenInstance = new library.eth.Contract(ERC20_ABI, token.address)
    let balance = await tokenInstance.methods.balanceOf(account).call()
    balance = balance / Math.pow(10, token.decimals)
    return balance
  }


  const mergeTokenList = async (source = []) => {
    const list = []
    setPending(true)
    for (const item of source) {
      let balances = {
        eth: undefined,
        sol: undefined
      }
      try {
        if (publicKey) balances.sol = await getSplBalance(item)
        if (account) balances.eth = await getEthBalance(item)
      } catch (e) {
        console.dir(e)
        // setError(e)
      }
      const token = Object.assign({}, item, {balances})
      list.push(token)
    }
    setSourceList(list)
    setPending(false)
  }
  useEffect(() => {
    if (sourceList.length) setSourceList([])
    setPending(true)
    fetch(`https://raw.githubusercontent.com/neonlabsorg/token-list/main/tokenlist.json`)
    .then((resp) => {
      if (resp.ok) {
        resp.json().then(data => {
          mergeTokenList(data.tokens)
        })
          .catch((err) => setError(err.message))
      }
    })
    .catch(err => {
      setError(`Failed to fetch neon transfer token list: ${err.message}`)
    }).finally(() => setPending(false))
  // eslint-disable-next-line
  }, [chainId, account, publicKey])
  const filteringChainId = useMemo(() => {
    if (isNaN(chainId)) return 111
    else return chainId
  }, [chainId])
  const list = useMemo(() => {
    const filtered = sourceList.filter(token => {
      return token.chainId === filteringChainId
    })
    return filtered
  }, [filteringChainId, sourceList])
  return <TokensContext.Provider
    value={{list, pending, error, tokenManagerOpened, setTokenManagerOpened}}>
    {children}
  </TokensContext.Provider>
}

export function useTokensContext() {
  return useContext(TokensContext)
}