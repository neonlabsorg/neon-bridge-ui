import CurrencySelect from '../../CurrencySelect'
import Input from '@/common/Input'
import Button from '@/common/Button'
import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react';
// import { useWeb3React } from '@web3-react/core'
import {PublicKey, Transaction, Keypair, TransactionInstruction} from '@solana/web3.js'
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as BufferLayout from 'buffer-layout'
// const web3 = require('web3')

const NEON_EVM_LOADER_ID = 'eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU'

const NeonTransferer = ({onSignTransfer = () => {}}) => {
  const [targetToken, setTargetToken] = useState(null)
  const [solanaBalance, setSolanaBalance] = useState(0)
  const [amount, setAmount] = useState(0)
  const [error, setError] = useState('')
  const { publicKey } = useWallet()
  // const { account } = useWeb3React()
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


    const createNeonAccountInstruction = () => {
      
      const dataLayout = BufferLayout.struct([
        BufferLayout.blob(4, 'tag'),
        BufferLayout.blob(8, 'lamports'),
        BufferLayout.blob(8, 'space'),
        BufferLayout.blob(20, 'etheraddress'),
        BufferLayout.u8('nonce')
      ]);
      const data = Buffer.alloc(dataLayout.span);
      dataLayout.encode({
        instruction: 3,
        // Transfer instruction
        amount: new u64(amount).toBuffer()
      }, data);
      return new TransactionInstruction({
        programId: NEON_EVM_LOADER_ID,
        data
      })
    }



  const createTransfer = async () => {
    if (error) setError('')
    // const accountSeed = web3.utils.hexToBytes(account)
    const solFromWallet = await PublicKey.findProgramAddress([new Uint8Array([1]), accountSeed], new PublicKey(NEON_EVM_LOADER_ID))
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
    const { signature } = await window.solana.signAndSendTransaction(transaction)

    console.log(signature)
    onSignTransfer(signature, fromWallet, toWallet.publicKey, targetToken, amount)
  }

  const handleCreateTransfer = async () => {
    try {
      await createTransfer()
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
    {error ? <div className='flex p-3 my-3 bg-red-500 rounded-lg'>
      {error}
    </div> : null}
  </>
}

export default NeonTransferer