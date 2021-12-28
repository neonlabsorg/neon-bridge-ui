import { useWeb3React } from '@web3-react/core'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnectionConfig } from '../../../contexts/connection';
import {PublicKey, Transaction, TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY} from '@solana/web3.js'
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

const NEON_EVM_LOADER_ID = 'eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU'
const NEON_MINT_TOKEN = '89dre8rZjLNft7HoupGiyxu3MNftR577ZYu8bHe2kK7g'

const web3 = require('web3')

export const useTransfering = () => {
  const { publicKey } = useWallet()
  const { account } = useWeb3React()
  const { connection } = useConnectionConfig()
  const mergeTypedArraysUnsafe = (a, b) => {
    const c = new a.constructor(a.length + b.length)
    c.set(a)
    c.set(b, a.length)
    return c
  }
  
  const getSolanaPubkey = (address = '') => {
    if (!address) return getSolanaWalletPubkey()
    return new PublicKey(address)
  }
  
  const getNeonMintTokenPubkey = () => {
    return getSolanaPubkey(NEON_MINT_TOKEN)
  }
  
  const getSolanaWalletPubkey = () => {
    return new PublicKey(publicKey)
  }
  
  const getEthSeed = (hex) => {
    return web3.utils.hexToBytes(hex)
  }
  
  const getNeonAccountSeed = () => {
    return getEthSeed(account)
  }
  
  const getNeonAccountAddress = async () => {
    const accountSeed = getNeonAccountSeed()
    const programAddress = await PublicKey.findProgramAddress([new Uint8Array([1]), accountSeed], new PublicKey(NEON_EVM_LOADER_ID))
    const neonAddress = programAddress[0]
    const neonNonce = programAddress[1]
    return {neonAddress, neonNonce}
  }
  
  const getNeonAccount = async () => {
    const {neonAddress} = await getNeonAccountAddress()
    const neonAccount = await connection.getAccountInfo(neonAddress)
    return neonAccount
  }
  
  const getERC20WrapperAddress = async (token = {
    name: '',
    address: '',
    address_spl: ''
  }) => {
    const enc = new TextEncoder()
    const tokenPubkey = getSolanaPubkey(token.address_spl)
    const erc20Seed = getEthSeed(token.address)
    const accountSeed = getNeonAccountSeed()
    const erc20addr = await PublicKey.findProgramAddress([
      new Uint8Array([1]),
      enc.encode('ERC20Balance'),
      tokenPubkey.toBytes(),
      erc20Seed,
      accountSeed
    ],new PublicKey(NEON_EVM_LOADER_ID))
    return {erc20Address: erc20addr[0], erc20Nonce: erc20addr[1]}
  }
  
  const getERC20WrapperAccount = async (token = {
    name: '',
    address: '',
    address_spl: ''
  }) => {
    const {erc20Address} = await getERC20WrapperAddress(token)
    const ERC20WrapperAccount = await connection.getAccountInfo(erc20Address)
    return ERC20WrapperAccount
  }
  
  
  const getNeonAccountInstructionKeys = async (neonAddress = '') => {
    const mintTokenPubkey = getNeonMintTokenPubkey()
    const solanaWalletPubkey = getSolanaWalletPubkey()
    const associatedAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mintTokenPubkey,
      neonAddress,
      true
    )
    return [
      { pubkey: solanaWalletPubkey, isSigner: true, isWritable: true },
      { pubkey: neonAddress, isSigner: false, isWritable: true },
      { pubkey: associatedAccount, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: mintTokenPubkey, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
    ]
  }
  
  const createERC20AccountInstruction = async (token = {
    name: '',
    address: '',
    address_spl: ''
  }) => {
    const data = new Uint8Array([0x0f])
    const solanaPubkey = getSolanaWalletPubkey()
    const mintPublicKey = getSolanaPubkey(token.address_spl)
    const {erc20Address} = await getERC20WrapperAddress(token)
    const {neonAddress} = await getNeonAccountAddress()
    const contractAddress = await PublicKey.findProgramAddress([
      new Uint8Array([1]),
      getEthSeed(token.address)
    ], new PublicKey(NEON_EVM_LOADER_ID))
    const keys = [
      { pubkey: solanaPubkey, isSigner: true, isWritable: true },
      { pubkey: erc20Address, isSigner: false, isWritable: true },
      { pubkey: neonAddress, isSigner: false, isWritable: true },
      { pubkey: contractAddress[0], isSigner: false, isWritable: true},
      { pubkey: mintPublicKey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
    ]
    const instruction = new TransactionInstruction({
      programId: new PublicKey(NEON_EVM_LOADER_ID),
      data,
      keys
    })
    return instruction
  }
  
  const createNeonAccountInstruction = async () => {
    const accountSeed = getNeonAccountSeed()
    const {neonAddress, neonNonce} = await getNeonAccountAddress()
    const keys = await getNeonAccountInstructionKeys(neonAddress)
    const pattern = new Uint8Array([0x2,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0])
    const instructionData = mergeTypedArraysUnsafe(mergeTypedArraysUnsafe(pattern, accountSeed), new Uint8Array([neonNonce]))
    return new TransactionInstruction({
      programId: new PublicKey(NEON_EVM_LOADER_ID),
      data: instructionData,
      keys
    })
  }
  
  const createTransferInstruction = async (token = {
    name: '',
    address: '',
    address_spl: '',
    decimals: 6
  }, amount = 0.0001, toSolana = false) => {
    const mintPubkey = getSolanaPubkey(token.address_spl)
    const solanaPubkey = getSolanaWalletPubkey()
    const {erc20Address} = await getERC20WrapperAddress(token)
    const associatedAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(token.address_spl),
      solanaPubkey
    )
    const fromTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mintPubkey,
      solanaPubkey
    )
    return Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      fromTokenAccount,
      toSolana ? associatedAccount : erc20Address,
      solanaPubkey,
      [],
      Number(amount) * Math.pow(10, token.decimals)
    )
  }

  
  const createNeonTransfer = async (token = {
    name: '',
    address: '',
    address_spl: '',
    decimals: 6
  },
  amount = 0.0001,
  onSign = () => {},
  onCreateNeonAccount = () => {}) => {
    const solanaPubkey = getSolanaWalletPubkey()
    const recentBlockhash = await connection.getRecentBlockhash()
    const transaction = new Transaction({
      recentBlockhash: recentBlockhash.blockhash,
      feePayer: solanaPubkey
    })
    const neonAccount = await getNeonAccount()
    if (!neonAccount) {
      const neonAccountInstruction = await createNeonAccountInstruction()
      transaction.add(neonAccountInstruction)
      onCreateNeonAccount()
    }
    const ERC20WrapperAccount = await getERC20WrapperAccount(token)
    if (!ERC20WrapperAccount) {
      const ERC20WrapperInstruction = await createERC20AccountInstruction(token)
      transaction.add(ERC20WrapperInstruction)
    }
    const transferInstruction = await createTransferInstruction(token, amount)
    transaction.add(transferInstruction)
    const signedTransaction = await window.solana.signTransaction(transaction)
    const sig = await connection.sendRawTransaction(signedTransaction.serialize())
    onSign(sig)
  }

  const createSolanaTransfer = async (token = {
    name: '',
    address: '',
    address_spl: '',
    decimals: 6
  }, amount = 0.0001, onSign = () => {}) => {
    const solanaPubkey = getSolanaPubkey()
    const recentBlockhash = await connection.getRecentBlockhash()
    const transactionParameters = {
      to: token.address, // Required except during contract publications.
      from: account,// must match user's active address.
      value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057' // Optional, but used for defining smart contract creation and interaction.
    };
    // txHash is a hex string
    // As with any RPC call, it may throw an error
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    const liquidityInstruction = await createTransferInstruction(token, amount, true)
    const transaction = new Transaction({
      recentBlockhash: recentBlockhash.blockhash,
      feePayer: solanaPubkey
    })
    transaction.add(liquidityInstruction)
    const signedTransaction = await window.solana.signTransaction(transaction)
    const sig = await connection.sendRawTransaction(signedTransaction.serialize())
    onSign(sig, txHash)
  }
  
  return {createSolanaTransfer, createNeonTransfer}
}