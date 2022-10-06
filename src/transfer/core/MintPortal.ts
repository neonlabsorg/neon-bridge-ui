import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  AccountMeta,
  Blockhash,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js';

import Big from 'big.js';
import { COMPUTE_BUDGET_ID, NEON_EVM_LOADER_ID, SPL_TOKEN_DEFAULT } from '../data';
import { InstructionService } from './InstructionService';
import ERC20SPL from '@/SplConverter/hooks/abi/ERC20ForSpl.json';
import { SPLToken } from '@/transfer/models';
import { SignedTransaction, TransactionConfig } from 'web3-core';
import { NeonIxBuilder } from '@/transfer/core/NeonIxBuilder';
import { TransactionFactory } from '@ethereumjs/tx';
import { TxData } from '@ethereumjs/tx/src/types';

// ERC-20 tokens
export class MintPortal extends InstructionService {
  // #region Solana -> Neon
  async createNeonTransfer(events = this.events, amount = 0, splToken = SPL_TOKEN_DEFAULT) {
    this.emitFunction(events.onBeforeCreateInstruction);
    const { blockhash } = await this.connection.getRecentBlockhash();
    const solanaKey = this.solanaWalletPubkey;
    const transaction = new Transaction({ recentBlockhash: blockhash, feePayer: solanaKey });
    const neonAccount = await this.getNeonAccount();

    if (!neonAccount) {
      const neonAccountInstruction = await this._createNeonAccountInstruction();
      transaction.add(neonAccountInstruction);
      this.emitFunction(events.onCreateNeonAccountInstruction);
    }

    const ERC20WrapperAccount = await this._getERC20WrapperAccount(splToken);
    if (!ERC20WrapperAccount) {
      const ERC20WrapperInstruction = await this._createERC20AccountInstruction(splToken);
      transaction.add(ERC20WrapperInstruction);
    }

    const transferInstruction = await this._createTransferInstruction(amount, splToken);
    transaction.add(transferInstruction);
    this.emitFunction(events.onBeforeSignTransaction);

    setTimeout(async () => {
      try {
        const signedTransaction = await this.solana.signTransaction(transaction);
        const sig = await this.connection.sendRawTransaction(signedTransaction.serialize());
        this.emitFunction(events.onSuccessSign, sig);
      } catch (error) {
        this.emitFunction(events.onErrorSign, error);
      }
    });
  }

  async createNeonTransferERC20(events = this.events, amount = 0, splToken = SPL_TOKEN_DEFAULT) {
    console.log(splToken);

    this.emitFunction(events.onBeforeCreateInstruction);
    const { blockhash } = await this.connection.getRecentBlockhash();
    const { neonAddress, neonNonce } = await this.getNeonAccountAddress();

    const solanaKey = this.solanaWalletPubkey;
    const transaction = this.transactionWithComputeBudget(blockhash, solanaKey);

    // acct_info
    const neonAccount = await this.getNeonAccount();
    if (!neonAccount) {
      const neonAccountInstruction = await this.createNeonAccountInstructionERC20(neonAddress, neonNonce);
      transaction.add(neonAccountInstruction);
      this.emitFunction(events.onCreateNeonAccountInstruction);
    }

    // SplTokenInstrutions
    const signers = [];
    const associatedToken = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(splToken.address_spl),
      this.solanaWalletPubkey
    );

    const tokenApproveInstruction = await Token.createApproveInstruction(
      TOKEN_PROGRAM_ID, // programId
      associatedToken, // account
      neonAddress, // delegate
      this.solanaWalletPubkey, // OWNER
      signers, // []
      amount // count
    );

    transaction.add(tokenApproveInstruction);
    this.emitFunction(events.onBeforeSignTransaction);

    console.log(associatedToken.toBase58(), neonAddress.toBase58());

    const claimInstruction = await this.createClaimInstruction(
      this.solanaWalletPubkey,
      associatedToken,
      splToken, //
      amount
    );

    console.log(transaction);

    // setTimeout(async () => {
    //   try {
    //     const signedTransaction = await this.solana.signTransaction(transaction);
    //     const sign = await this.connection.sendRawTransaction(signedTransaction.serialize());
    //     this.emitFunction(events.onSuccessSign, sign);
    //   } catch (e) {
    //     this.emitFunction(events.onErrorSign, e);
    //   }
    // });
  }

  transactionWithComputeBudget(recentBlockhash: Blockhash, feePayer: PublicKey): Transaction {
    const transaction = new Transaction({ recentBlockhash, feePayer });
    const computeBudgetUtils = new TransactionInstruction({
      programId: new PublicKey(COMPUTE_BUDGET_ID),
      data: this.mergeTypedArraysUnsafe(
        this.mergeTypedArraysUnsafe(
          new Uint8Array(this.bytesFromHex(0x00)),
          new Uint8Array([0])
        ),
        new Uint8Array([500000]) // NEON_COMPUTE_UNITS
      ),
      keys: []
    });
    const computeHeapFrame = new TransactionInstruction({
      programId: new PublicKey(COMPUTE_BUDGET_ID),
      data: this.mergeTypedArraysUnsafe(
        new Uint8Array(this.bytesFromHex(0x01)),
        new Uint8Array([262144]) // NEON_HEAP_FRAME
      ),
      keys: []
    });
    transaction.add(computeBudgetUtils);
    transaction.add(computeHeapFrame);

    return transaction;
  }

  async createClaimInstruction(owner: PublicKey, from: PublicKey, splToken: SPLToken, amount: number) {
    const computedAmount = this._computeWithdrawAmountValue(amount, splToken);
    const nonce = await this.web3.eth.getTransactionCount(splToken.address);
    const contract = new this.web3.eth.Contract(ERC20SPL['abi'] as any);
    const claimTransaction = contract.methods.claim(from.toBytes(), computedAmount).encodeABI();

    try {
      const transaction: TransactionConfig = {
        nonce: nonce,
        gas: `0x54EC`,
        gasPrice: `0x54EC`,
        from: this.neonWalletAddress,
        to: splToken.address, // contract address
        data: claimTransaction,
        chainId: splToken.chainId
      };

      const signedTransaction = await this.accountTransactionSign(transaction);
      const neonEmulate = await this.proxyApi.neonEmulate([signedTransaction.rawTransaction.slice(2)]);
      console.log(neonEmulate, signedTransaction);

      const accountsMap = new Map<string, AccountMeta>();
      if (neonEmulate) {
        for (const account of neonEmulate['accounts']) {
          const key = account['account'];
          accountsMap.set(key, { pubkey: new PublicKey(key), isSigner: false, isWritable: true });
          if (account['contract']) {
            const key = account['contract'];
            accountsMap.set(key, { pubkey: new PublicKey(key), isSigner: false, isWritable: true });
          }
        }

        for (const account of neonEmulate['solana_accounts']) {
          const key = account['pubkey'];
          accountsMap.set(key, { pubkey: new PublicKey(key), isSigner: false, isWritable: true });
        }
      }

      const accountsArray = Array.from(accountsMap.values());

      const neon = new NeonIxBuilder(owner);
      neon.initOperatorEther(splToken.address);
      neon.initEtherTransaction(transaction, signedTransaction);
      neon.initEtherAccounts(accountsArray);

      console.log(accountsArray);
      return neonEmulate;
    } catch (e) {
      console.log(e);
    }
    return null;
  }

  async accountTransactionSign(transaction: TransactionConfig): Promise<SignedTransaction> {
    const account = this.web3.eth.accounts.create();
    return await this.web3.eth.accounts.signTransaction(transaction, account.privateKey);
  }

  async transactionSign(transaction: TxData): Promise<any> {
    const trx = TransactionFactory.fromTxData(transaction);
    const serialized = trx.serialize();
    console.log(trx, serialized.toString('hex'));
    const message = this.web3.utils.keccak256(`0x${serialized.toString('hex')}`);
    const signature = await this.web3.eth.sign(message, this.neonWalletAddress);
    console.log('message', message);
    console.log('signature', signature);
    return signature;
  }

  async _createERC20AccountInstruction(splToken) {
    const data = new Buffer([0x0f]);
    const solanaPubkey = this.solanaWalletPubkey;
    const mintPublicKey = this.solanaPubkey(splToken.address_spl);
    const { erc20Address } = await this._getERC20WrapperAddress(splToken);
    const { neonAddress } = await this.getNeonAccountAddress();
    const contractAddress = await PublicKey.findProgramAddress(
      [new Uint8Array([1]), Uint8Array.from(this._getEthSeed(splToken.address))],
      new PublicKey(NEON_EVM_LOADER_ID)
    );

    const keys = [
      { pubkey: solanaPubkey, isSigner: true, isWritable: true },
      { pubkey: erc20Address, isSigner: false, isWritable: true },
      { pubkey: neonAddress, isSigner: false, isWritable: true },
      { pubkey: contractAddress[0], isSigner: false, isWritable: true },
      { pubkey: mintPublicKey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
    ];

    return new TransactionInstruction({ programId: new PublicKey(NEON_EVM_LOADER_ID), data, keys });
  }

  async _getERC20WrapperAccount(splToken) {
    const { erc20Address } = await this._getERC20WrapperAddress(splToken);
    return this.connection.getAccountInfo(erc20Address);
  }

  // #endregion

  // #region Neon -> Solana
  async createSolanaTransfer(
    events = undefined,
    amount = 0,
    splToken = {
      chainId: 0,
      address_spl: '',
      address: '',
      decimals: 1,
      name: '',
      symbol: '',
      logoURI: ''
    }
  ) {
    events = events === undefined ? this.events : events;
    const solanaPubkey = this.solanaPubkey();
    const recentBlockhash = await this.connection.getRecentBlockhash();
    if (typeof events.onBeforeNeonSign === 'function') {
      events.onBeforeNeonSign();
    }

    // txHash is a hex string
    // As with any RPC call, it may throw an error
    let txHash;
    try {
      txHash = await this.ethereum.request({
        method: 'eth_sendTransaction',
        params: [this.getEthereumTransactionParams(amount, splToken)]
      });
    } catch (error) {
      if (typeof events.onErrorSign === 'function') {
        events.onErrorSign(error);
      }
    }
    if (txHash === undefined) {
      return false;
    }

    const transaction = new Transaction({
      recentBlockhash: recentBlockhash.blockhash,
      feePayer: solanaPubkey
    });
    const mintPubkey = this.solanaPubkey(splToken.address_spl);
    const assocTokenAccountAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mintPubkey,
      solanaPubkey
    );
    const associatedTokenAccount = await this.connection.getAccountInfo(assocTokenAccountAddress);
    if (!associatedTokenAccount) {
      // Create token account if it not exists
      const createAccountInstruction = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintPubkey, // token mint
        assocTokenAccountAddress, // account to create
        solanaPubkey, // new account owner
        solanaPubkey // payer
      );
      transaction.add(createAccountInstruction);
    }

    const liquidityInstruction = await this._createTransferInstruction(amount, splToken, true);
    transaction.add(liquidityInstruction);

    if (typeof events.onBeforeSignTransaction === 'function') {
      events.onBeforeSignTransaction();
    }

    setTimeout(async () => {
      try {
        const signedTransaction = await this.solana.signTransaction(transaction);
        const sig = await this.connection.sendRawTransaction(signedTransaction.serialize());
        if (typeof events.onSuccessSign === 'function') events.onSuccessSign(sig, txHash);
      } catch (error) {
        if (typeof events.onErrorSign === 'function') events.onErrorSign(error);
      }
    });
  }

  // #endregion

  async _createTransferInstruction(amount: number, splToken, toSolana = false) {
    const mintPubkey = this.solanaPubkey(splToken.address_spl);
    const solanaPubkey = this.solanaWalletPubkey;
    const { erc20Address } = await this._getERC20WrapperAddress(splToken);
    const solanaBalanceAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mintPubkey,
      solanaPubkey
    );

    return Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      toSolana ? erc20Address : solanaBalanceAccount,
      toSolana ? solanaBalanceAccount : erc20Address,
      solanaPubkey,
      [],
      // @ts-ignore
      Big(amount).times(Big(10).pow(splToken.decimals)).toString()
    );
  }

  async _getERC20WrapperAddress(splToken) {
    const enc = new TextEncoder();
    const tokenPubkey = this.solanaPubkey(splToken.address_spl);
    const erc20Seed = this._getEthSeed(splToken.address);
    const accountSeed = this.neonAccountSeed;
    const erc20addr = await PublicKey.findProgramAddress(
      [
        new Uint8Array([1]),
        enc.encode('ERC20Balance'),
        tokenPubkey.toBytes(),
        erc20Seed,
        accountSeed
      ],
      new PublicKey(NEON_EVM_LOADER_ID)
    );

    return { erc20Address: erc20addr[0], erc20Nonce: erc20addr[1] };
  }

  _computeWithdrawAmountValue(amount, { decimals }): string {
    const result = Big(amount).times(Big(10).pow(decimals));
    return `0x${BigInt(result).toString(16)}`;
  }
}
