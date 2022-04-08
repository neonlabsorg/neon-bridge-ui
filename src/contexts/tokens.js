import { useWallet } from "@solana/wallet-adapter-react";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState, useMemo, createContext, useContext } from "react";
import { useNetworkType } from "../SplConverter/hooks";
import { useConnection } from "./connection";
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from '@solana/web3.js'
import ERC20_ABI from '../SplConverter/hooks/abi/erc20.json'
import {NEON_TOKEN_MINT, NEON_TOKEN_MINT_DECIMALS} from 'neon-portal/src/constants'
import { CHAIN_IDS } from "../connectors";

export const TokensContext = createContext({
  list: [],
  tokenErrors: {},
  pending: false,
  tokenManagerOpened: false,
  setTokenManagerOpened: () => {},
  updateTokenList: () => {}
});

const NEON_TOKEN_MODEL = {
  chainId: 0,
  address_spl: NEON_TOKEN_MINT,
  address: "",
  decimals: NEON_TOKEN_MINT_DECIMALS,
  name: "Neon",
  symbol: "NEON",
  logoURI: "https://raw.githubusercontent.com/neonlabsorg/token-list/main/neon_token_md.png"
}

export function TokensProvider({ children = undefined}) {
  const initialTokenListState = useMemo(() => Object.keys(CHAIN_IDS).map(key => {
    const chainId = CHAIN_IDS[key]
    const model = Object.assign({}, NEON_TOKEN_MODEL)
    model.chainId = chainId
    return model
  }), [])
  const {chainId} = useNetworkType()
  const {publicKey} = useWallet()
  const {library, account} = useWeb3React()
  const connection = useConnection()
  const [list, setTokenList] = useState(initialTokenListState)
  const [pending, setPending] = useState(false)
  const [tokenManagerOpened, setTokenManagerOpened] = useState(false)

  const [error, setError] = useState('')

  const [tokenErrors, setTokenErrors] = useState({})

  const [balances, setBalances] = useState({})
  const addBalance = (symbol, balance) => {
    balances[symbol] = balance
    setBalances({...balances})
  }

  const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const filteringChainId = useMemo(() => {
    if (Number.isNaN(chainId)) return CHAIN_IDS['devnet']
    return chainId
  }, [chainId])


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
    ]).catch(e => {
      console.warn(e)
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
    if (token.address_spl === NEON_TOKEN_MINT) {
      const balance = await library.eth.getBalance(account)
      return +(balance / Math.pow(10, token.decimals)).toFixed(4)
    }

    const tokenInstance = new library.eth.Contract(ERC20_ABI, token.address)
    const balance = await tokenInstance.methods.balanceOf(account).call()
    return balance / Math.pow(10, token.decimals)
  }

  const requestListBalances = async () => {
    for (const item of list) {
      let sol, eth
      try {
        if (publicKey) {
          sol = await getSplBalance(item)
        } else {
          sol = undefined
        }
        if (account) {
          eth = await getEthBalance(item)
        } else {
          eth = undefined
        }
        setTimeout(() => addBalance(item.symbol, {sol, eth}))
      } catch (e) {
        console.warn(e)
      }
    }
  }

  const mergeTokenList = async (source = []) => {
    const fullList = initialTokenListState.concat(source)
    const newList = fullList.filter((item) => item.chainId === filteringChainId)
    setTokenList(newList)
    setTimeout(async () => {
      await requestListBalances()
    })
  }
  const updateTokenList = () => {
    setTokenErrors({})
    setTokenList(initialTokenListState)
    setBalances({})
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
  }


  useEffect(() => {
    updateTokenList()
  // eslint-disable-next-line
  }, [chainId, account, publicKey])

  return <TokensContext.Provider
    value={{list, pending, error, tokenErrors, balances, tokenManagerOpened, setTokenManagerOpened, updateTokenList}}>
    {children}
  </TokensContext.Provider>
}

export function useTokensContext() {
  return useContext(TokensContext)
}