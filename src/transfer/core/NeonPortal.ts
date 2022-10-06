import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import Big from 'big.js';
import { InstructionService } from './InstructionService';
import {
  EvmInstruction,
  NEON_EVM_LOADER_ID,
  NEON_TOKEN_DECIMALS,
  NEON_TOKEN_MINT,
  SPL_TOKEN_DEFAULT
} from '../data';
import { SPLToken } from '@/transfer/models';

// Neon-token
export class NeonPortal extends InstructionService {
  // #region Solana -> Neon
  async createNeonTransfer(events = this.events, amount = 0) {
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

    const approveInstruction = await this._createApproveDepositInstruction(amount);
    transaction.add(approveInstruction);

    const solanaPubkey = this.solanaWalletPubkey;
    const source = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(NEON_TOKEN_MINT),
      solanaPubkey
    );
    const authority = await this._getAuthorityPoolAddress();
    const pool = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(NEON_TOKEN_MINT),
      authority,
      true
    );
    const { neonAddress } = await this.getNeonAccountAddress();

    const keys = [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: pool, isSigner: false, isWritable: true },
      { pubkey: neonAddress, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: this.solanaWalletPubkey, isSigner: true, isWritable: true }, // operator
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    const bNeonAccount = new Buffer(this.neonWalletAddress.slice(2), 'hex');
    const data = new Buffer([EvmInstruction.DepositV03, ...bNeonAccount]);
    const depositInstruction = new TransactionInstruction({
      programId: new PublicKey(NEON_EVM_LOADER_ID),
      keys,
      data // 0x27 -> 39
    });
    transaction.add(depositInstruction);
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

  createNeonTransferERC20 = this.createNeonTransfer;

  async _createApproveDepositInstruction(amount) {
    const solanaPubkey = this.solanaPubkey();
    const source = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(NEON_TOKEN_MINT),
      solanaPubkey
    );
    const { neonAddress } = await this.getNeonAccountAddress();

    return Token.createApproveInstruction(
      TOKEN_PROGRAM_ID,
      source,
      neonAddress,
      solanaPubkey,
      [],
      // @ts-ignore
      Big(amount).times(Big(10).pow(NEON_TOKEN_DECIMALS)).toString()
    );
  }

  async _getAuthorityPoolAddress(): Promise<PublicKey> {
    const enc = new TextEncoder();
    const [authority] = await PublicKey.findProgramAddress([enc.encode('Deposit')], new PublicKey(NEON_EVM_LOADER_ID));
    return authority;
  }

  // #endregion

  // #region Neon -> Solana
  async createSolanaTransfer(events = undefined, amount = 0, splToken = SPL_TOKEN_DEFAULT) {
    events = events === undefined ? this.events : events;
    if (typeof events.onBeforeSignTransaction === 'function') {
      events.onBeforeSignTransaction();
    }
    try {
      const txHash = await this.ethereum.request({
        method: 'eth_sendTransaction',
        params: [this.getEthereumTransactionParams(amount, splToken)]
      });
      if (typeof events.onSuccessSign === 'function') {
        events.onSuccessSign(undefined, txHash);
      }
    } catch (error) {
      if (typeof events.onErrorSign === 'function') {
        events.onErrorSign(error);
      }
    }
  }

  getEthereumTransactionParams(amount: number, token: SPLToken) {
    return {
      to: '0x053e3d1b12726f648B2e45CEAbDF9078B742576D',
      from: this.neonWalletAddress,
      value: this._computeWithdrawAmountValue(amount, token),
      data: this._computeWithdrawEthTransactionData()
    };
  }

  _computeWithdrawEthTransactionData(): string {
    const withdrawMethodID = '0x8e19899e';
    const solanaPubkey = this.solanaPubkey();
    // @ts-ignore
    const solanaStr = solanaPubkey.toBytes().toString('hex');
    return `${withdrawMethodID}${solanaStr}`;
  }

  _computeWithdrawAmountValue(amount, { decimals }): string {
    const result = Big(amount).times(Big(10).pow(decimals));
    return `0x${BigInt(result).toString(16)}`;
  }

  // #endregion
}
