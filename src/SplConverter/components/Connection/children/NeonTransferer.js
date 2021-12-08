import CurrencySelect from '../../CurrencySelect'
import Input from '@/common/Input'
import Button from '@/common/Button'
import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react';
import { useWeb3React } from '@web3-react/core'
import {PublicKey, Transaction, Keypair, TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY} from '@solana/web3.js'
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as BufferLayout from 'buffer-layout'
const web3 = require('web3')

const NEON_EVM_LOADER_ID = 'eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU'
const NEON_MINT_TOKEN = '89dre8rZjLNft7HoupGiyxu3MNftR577ZYu8bHe2kK7g'

const NeonTransferer = ({onSignTransfer = () => {}}) => {
  const [targetToken, setTargetToken] = useState(null)
  const [solanaBalance, setSolanaBalance] = useState(0)
  const [amount, setAmount] = useState(0)
  const [error, setError] = useState('')
  const { publicKey } = useWallet()
  const { account } = useWeb3React()
  const { connection } = useConnection()



  useEffect(() => {
      if (!connection || !publicKey) return;
      connection.getBalance(publicKey)
        .then(value => {
          const lamports = value,
            lamportBySol = 0.000000001
            setSolanaBalance(lamports * lamportBySol)
        }).catch(err => {
          console.warn(err)
        })
        console.dir(BufferLayout)
    }, [connection, publicKey])

    const mergeTypedArraysUnsafe = (a, b) => {
      var c = new a.constructor(a.length + b.length);
      c.set(a);
      c.set(b, a.length);
  
      return c;
    }


    const createERC20AccountInstruction = async () => {
      const data = new Uint8Array([0x0f])
      const ownerPublicKey = new PublicKey(publicKey)
      const targetTokenPublicKey = new PublicKey(targetToken.address_spl)
      const accountSeed = web3.utils.hexToBytes(account)
      const enc = new TextEncoder()
      const toERC20TokenWallet = await PublicKey.findProgramAddress([new Uint8Array([1]), enc.encode('ERC20Balance'), targetTokenPublicKey.toBytes(), accountSeed], new PublicKey(NEON_EVM_LOADER_ID))
      const toNeonWallet = await PublicKey.findProgramAddress([new Uint8Array([1]), accountSeed], new PublicKey(NEON_EVM_LOADER_ID))
      const contractAddress = await PublicKey.findProgramAddress([new Uint8Array([1]), web3.utils.hexToBytes(targetToken.address)], new PublicKey(NEON_EVM_LOADER_ID))
      const keys = [
        {
          pubkey: ownerPublicKey,
          isSigner: true,
          isWritable: true
        }, {
          pubkey: toERC20TokenWallet[0],
          isSigner: false,
          isWritable: true
        }, {
          pubkey: toNeonWallet[0],
          isSigner: false,
          isWritable: true
        }, {
          pubkey: contractAddress[0],
          isSigner: false,
          isWritable: true
        }, {
          pubkey: targetTokenPublicKey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: SYSVAR_RENT_PUBKEY,
          isSigner: false,
          isWritable: false
        }
      ]
      const instruction = new TransactionInstruction({
        programId: new PublicKey(NEON_EVM_LOADER_ID),
        data,
        keys
      })
      return instruction
    }
    const getNeonAccountWithNonce = async () => {
      const accountSeed = web3.utils.hexToBytes(account)
      const toWallet = await PublicKey.findProgramAddress([new Uint8Array([1]), accountSeed], new PublicKey(NEON_EVM_LOADER_ID))
      return toWallet
    }
    const createNeonAccountInstruction = async () => {
      const dataArray = new Uint8Array([0x2,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0])
      const accountSeed = web3.utils.hexToBytes(account)
      const toWallet = await PublicKey.findProgramAddress([new Uint8Array([1]), accountSeed], new PublicKey(NEON_EVM_LOADER_ID))
      const nonce = toWallet[1]
      const eth3data = mergeTypedArraysUnsafe(mergeTypedArraysUnsafe(dataArray, accountSeed), new Uint8Array([nonce]))
      const mintPublicKey = new PublicKey(NEON_MINT_TOKEN)
      const ownerPublicKey = new PublicKey(publicKey)
      const associatedAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintPublicKey,
        toWallet[0],
        true
      )
      const keys = [
        {
          pubkey: ownerPublicKey,
          isSigner: true,
          isWritable: true
        },
        {
          pubkey: toWallet[0],
          isSigner: false,
          isWritable: true
        },
        {
          pubkey: associatedAccount,
          isSigner: false,
          isWritable: true
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false
        },
        {
          pubkey: mintPublicKey,
          isSigner: false,
          isWritable: false
        },
        {
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false
        },
        {
          pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: SYSVAR_RENT_PUBKEY,
          isSigner: false,
          isWritable: false
        }
      ]

      const instruction = new TransactionInstruction({
        programId: new PublicKey(NEON_EVM_LOADER_ID),
        data: eth3data,
        keys
      })
      keys.forEach(key => {
        console.log(key.pubkey.toString())
      })
      // console.dir(keys)
      return instruction
    }

  const createNeonTransfer = async () => {
    const fromWallet = new PublicKey(publicKey)
    const recentBlockhash = await connection.getRecentBlockhash()
    const neonAccountWithNonce = await getNeonAccountWithNonce()

    const transaction = new Transaction({
      recentBlockhash: recentBlockhash.blockhash,
      feePayer: fromWallet
    })
    const neonAccount = await connection.getAccountInfo(neonAccountWithNonce[0])
    if (!neonAccount) {
      const neonAccountInstruction = await createNeonAccountInstruction()
      console.log('add new neon addr ', neonAccountInstruction)
      transaction.add(neonAccountInstruction)
    }
    const targetTokenPublicKey = new PublicKey(targetToken.address_spl)
    const accountSeed = web3.utils.hexToBytes(account)
    const enc = new TextEncoder()
    const erc20addrWithNonce = await PublicKey.findProgramAddress([new Uint8Array([1]), enc.encode('ERC20Balance'), targetTokenPublicKey.toBytes(), accountSeed], new PublicKey(NEON_EVM_LOADER_ID))
    const erc20addr = await connection.getAccountInfo(erc20addrWithNonce[0])
    if (!erc20addr) {
      
      const erc20AccountInstruction = await createERC20AccountInstruction()
      console.log('add new erc20 addr ', erc20AccountInstruction)
      transaction.add(erc20AccountInstruction)
    }
    console.log('before sign ', transaction)
    const signedTransaction = await window.solana.signTransaction(transaction)
    const sig = await connection.sendRawTransaction(signedTransaction.serialize())
    onSignTransfer(sig, '', '', '', '')
  }

  const createTransfer = async () => {
    if (error) setError('')
    // const accountSeed = web3.utils.hexToBytes(account)
    // const solFromWallet = await PublicKey.findProgramAddress([new Uint8Array([1]), accountSeed], new PublicKey(NEON_EVM_LOADER_ID))
    const fromWallet = new PublicKey(publicKey)
    const toWallet = Keypair.generate()
    const mintPublicKey = new PublicKey(targetToken.address_spl)
    const mintToken = new Token(
      connection,
      mintPublicKey,
      TOKEN_PROGRAM_ID,
      fromWallet
    );
    const recentBlockhash = await connection.getRecentBlockhash()
    console.log(toWallet, recentBlockhash)
    // const r = await mintToken.createAssociatedTokenAccount(toWallet.publicKey)
    // console.dir(r)
    const fromTokenAccount = await mintToken.getOrCreateAssociatedAccountInfo(
      new PublicKey(publicKey)
    );
    // const toTokenAccount = await mintToken.getOrCreateAssociatedAccountInfo(
    //   toWallet.publicKey
    // );
    const associatedAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mintPublicKey,
      toWallet.publicKey
    );
    const transaction = new Transaction({
      recentBlockhash: recentBlockhash.blockhash,
      feePayer: fromWallet
    })
    .add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintPublicKey,
        associatedAccount,
        toWallet.publicKey,
        fromWallet,
      )
    )
    .add(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        fromTokenAccount.address,
        associatedAccount,
        fromWallet,
        [],
        Number(amount)
      )
    );
    const signedTransaction = await window.solana.signTransaction(transaction)
    // console.log(signedTransaction)
    const sig = await connection.sendRawTransaction(signedTransaction.serialize())
    onSignTransfer(sig, fromWallet, toWallet.publicKey, targetToken, amount)
  }

  const handleCreateTransfer = async () => {
    try {
      await createNeonTransfer()
    } catch (err) {
      setError(err.message)
      console.warn(err)
      return
    }
  }
  return <>
    <div className='flex xs:flex-col mb-4'>
      <div className='sm:w-1/2 xs:w-full flex flex-col'>
        <span className='mb-2'>Select a token</span>
        <CurrencySelect className='self-start' currency={targetToken} onChangeCurrency={(token) => setTargetToken(token)}/>
      </div>
      <div className='sm:w-1/2 xs:w-full flex flex-col'>
        <span className='mb-2'>Enter token amount</span>
        <div v-if={solanaBalance} className='flex items-center'>
          <div className='flex flex-col'>
            <Input value={amount}
              type='number'
              className='mb-4'
              error={amount > solanaBalance}
              onChange={(value) => {
                setAmount(Number(value))
              }}/>
              {amount > solanaBalance ? <span className='text-red-400'>{`Max balance: ${solanaBalance} SOL`}</span> : null }
          </div>
        </div>
      </div>
    </div>
    <Button disabled={amount <= 0 || amount > solanaBalance || !targetToken}
      onClick={handleCreateTransfer}>Transfer</Button>
    <Button className='ml-2' onClick={createERC20AccountInstruction}>Create neon account instruction</Button>
    {error ? <div className='flex p-3 my-3 bg-red-500 rounded-lg'>
      {error}
    </div> : null}
  </>
}

export default NeonTransferer