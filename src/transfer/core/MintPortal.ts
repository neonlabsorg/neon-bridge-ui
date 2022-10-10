import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  AccountMeta,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js';
import { Account, SignedTransaction, TransactionConfig } from 'web3-core';
import { Buffer } from 'buffer';
import Big from 'big.js';

import ERC20SPL from '@/SplConverter/hooks/abi/ERC20ForSpl.json';
import { SPLToken } from '@/transfer/models';
import { etherToProgram, toBytesInt32, toFullAmount } from '@/transfer/utils/address';
import { SHA256 } from 'crypto-js';
import {
  COLLATERALL_POOL_MAX,
  COMPUTE_BUDGET_ID,
  EvmInstruction,
  NEON_COMPUTE_UNITS,
  NEON_EVM_LOADER_ID,
  NEON_HEAP_FRAME,
  NEON_POOL_BASE,
  SPL_TOKEN_DEFAULT
} from '../data';
import { InstructionService } from './InstructionService';

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

  async createNeonTransferERC20(events = this.events, amount: number, splToken = SPL_TOKEN_DEFAULT) {
    const fullAmount = toFullAmount(amount, splToken.decimals);
    const splTokenMint = new PublicKey(splToken.address_spl);
    const computedBudgetProgram = new PublicKey(COMPUTE_BUDGET_ID);
    const solanaWallet = this.solanaWalletPubkey;
    const emulateSignerPrivateKey = `0x${SHA256(this.solanaWalletPubkey.toBase58()).toString()}`;
    const emulateSigner = this.web3.eth.accounts.privateKeyToAccount(emulateSignerPrivateKey);
    const [accountPDA] = await etherToProgram(emulateSigner.address);
    const { blockhash } = await this.connection.getRecentBlockhash();
    const { neonAddress } = await this.getNeonAccountAddress();
    const signers = [];
    const transaction = new Transaction({ recentBlockhash: blockhash, feePayer: solanaWallet });
    this.emitFunction(events.onBeforeCreateInstruction);

    // 0, 1
    transaction.add(this.computeBudgetUtilsInstruction(computedBudgetProgram));
    transaction.add(this.computeBudgetHeapFrameInstruction(computedBudgetProgram));

    const associatedTokenAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      splTokenMint,
      solanaWallet
    );

    // 2
    transaction.add(Token.createApproveInstruction(
      TOKEN_PROGRAM_ID,
      associatedTokenAddress,
      accountPDA,
      solanaWallet,
      signers,
      Number(fullAmount.toString(10))
    ));

    this.emitFunction(events.onBeforeSignTransaction);

    const { neonKeys, neonTransaction, nonce } = await this.createClaimInstruction(
      solanaWallet,
      associatedTokenAddress,
      this.neonWalletAddress,
      splToken,
      emulateSigner,
      fullAmount
    );

    // 3
    if (nonce === 0) {
      transaction.add(this.createAccountV3Instruction(solanaWallet, accountPDA, emulateSigner));
    }

    // 4
    transaction.add(await this.makeTrExecFromDataIx(neonAddress, neonTransaction?.rawTransaction, neonKeys));

    setTimeout(async () => {
      try {
        const signedTransaction = await this.solana.signTransaction(transaction);
        const sign = await this.connection.sendRawTransaction(signedTransaction.serialize(), { skipPreflight: true });
        this.emitFunction(events.onSuccessSign, sign);
      } catch (e) {
        this.emitFunction(events.onErrorSign, e);
      }
    });
  }

  createAccountV3Instruction(solanaWallet: PublicKey, emulateSignerPDA: PublicKey, emulateSigner: Account): TransactionInstruction {
    const a = new Buffer([EvmInstruction.CreateAccountV03]);
    const b = new Buffer(emulateSigner.address.slice(2), 'hex');
    const data = Buffer.concat([a, b]);
    return new TransactionInstruction({
      programId: new PublicKey(NEON_EVM_LOADER_ID),
      keys: [
        { pubkey: solanaWallet, isWritable: true, isSigner: true },
        { pubkey: SystemProgram.programId, isWritable: false, isSigner: false },
        { pubkey: emulateSignerPDA, isWritable: true, isSigner: false }
      ],
      data
    });
  }

  computeBudgetUtilsInstruction(programId: PublicKey): TransactionInstruction {
    const a = Buffer.from([0x00]);
    const b = Buffer.from(toBytesInt32(NEON_COMPUTE_UNITS));
    const c = Buffer.from(toBytesInt32(0));
    const data = Buffer.concat([a, b, c]);
    return new TransactionInstruction({ programId, data, keys: [] });
  }

  computeBudgetHeapFrameInstruction(programId: PublicKey): TransactionInstruction {
    const a = new Buffer([0x01]);
    const b = Buffer.from(toBytesInt32(NEON_HEAP_FRAME));
    const data = Buffer.concat([a, b]);
    return new TransactionInstruction({ programId, data, keys: [] });
  }

  async createClaimInstruction(owner: PublicKey, from: PublicKey, to: string, splToken: SPLToken, emulateSigner: Account, amount: any): Promise<{ neonKeys: AccountMeta[], neonTransaction: SignedTransaction, emulateSigner: Account, nonce: number }> {
    const nonce = await this.web3.eth.getTransactionCount(emulateSigner.address);
    const contract = new this.web3.eth.Contract(ERC20SPL['abi'] as any);
    const claimTransaction = contract.methods.claimTo(from.toBytes(), to, amount).encodeABI();
    try {
      const transaction: TransactionConfig = {
        nonce: nonce,
        gas: `0x5F5E100`, // 100000000
        gasPrice: `0x0`,
        from: this.neonWalletAddress,
        to: splToken.address, // contract address
        data: claimTransaction,
        chainId: splToken.chainId
      };

      const signedTransaction = await this.accountTransactionSign(transaction, emulateSigner);
      const neonEmulate = await this.proxyApi.neonEmulate([signedTransaction.rawTransaction.slice(2)]);

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

      return {
        neonKeys: Array.from(accountsMap.values()),
        neonTransaction: signedTransaction,
        emulateSigner,
        nonce
      };
    } catch (e) {
      console.log(e);
    }
    return { neonKeys: [], neonTransaction: null, emulateSigner: null, nonce };
  }


  async makeTrExecFromDataIx(neonAddress: PublicKey, neonRawTransaction: string, neonKeys: AccountMeta[]): Promise<TransactionInstruction> {
    const programId = new PublicKey(NEON_EVM_LOADER_ID);
    const treasuryPoolIndex = Math.floor(Math.random() * COLLATERALL_POOL_MAX) % COLLATERALL_POOL_MAX;
    const treasuryPoolAddress = await this.createCollateralPoolAddress(treasuryPoolIndex);
    const a = Buffer.from([EvmInstruction.TransactionExecuteFromData]);
    const b = Buffer.from(toBytesInt32(treasuryPoolIndex));
    const c = Buffer.from(neonRawTransaction.slice(2), 'hex');
    const data = Buffer.concat([a, b, c]);
    const keys: AccountMeta[] = [
      { pubkey: this.solanaWalletPubkey, isSigner: true, isWritable: true },
      { pubkey: treasuryPoolAddress, isSigner: false, isWritable: true },
      { pubkey: neonAddress, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: programId, isSigner: false, isWritable: false },
      ...neonKeys
    ];

    return new TransactionInstruction({ programId, keys, data });
  }

  async createCollateralPoolAddress(collateralPoolIndex: number): Promise<PublicKey> {
    const COLLATERAL_SEED = 'collateral_seed_';
    const seed = COLLATERAL_SEED + collateralPoolIndex.toString();
    const collateralPoolBase = new PublicKey(NEON_POOL_BASE);
    return PublicKey.createWithSeed(collateralPoolBase, seed, new PublicKey(NEON_EVM_LOADER_ID));
  }

  async accountTransactionSign(transaction: TransactionConfig, accountSigner: Account): Promise<SignedTransaction> {
    return await accountSigner.signTransaction(transaction);
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
