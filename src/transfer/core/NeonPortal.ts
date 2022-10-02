import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import Big from 'big.js';
import { InstructionService } from './InstructionService';
import {
  NEON_EVM_LOADER_ID,
  NEON_TOKEN_DECIMALS,
  NEON_TOKEN_MINT,
  SPL_TOKEN_DEFAULT
} from '../constants';

// Neon-token
export class NeonPortal extends InstructionService {
  // #region Solana -> Neon
  async createNeonTransfer(events = this.events, amount = 0) {
    if (typeof events.onBeforeCreateInstruction === 'function') {
      events.onBeforeCreateInstruction();
    }
    const { blockhash } = await this.connection.getRecentBlockhash();
    const solanaKey = this._getSolanaWalletPubkey();
    const transaction = new Transaction({ recentBlockhash: blockhash, feePayer: solanaKey });
    const neonAccount = await this.getNeonAccount();

    if (!neonAccount) {
      const neonAccountInstruction = await this._createNeonAccountInstruction();
      transaction.add(neonAccountInstruction);
      if (typeof events.onCreateNeonAccountInstruction === 'function') {
        events.onCreateNeonAccountInstruction();
      }
    }

    const approveInstruction = await this._createApproveDepositInstruction(amount);
    transaction.add(approveInstruction);

    const solanaPubkey = this._getSolanaWalletPubkey();
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
    const { neonAddress } = await this._getNeonAccountAddress();

    const keys = [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: pool, isSigner: false, isWritable: true },
      { pubkey: neonAddress, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
    ];

    // const data = [Number.parseInt('0x19', 16)];
    // console.log(new Buffer([0x19]));

    const depositInstruction = new TransactionInstruction({
      programId: new PublicKey(NEON_EVM_LOADER_ID),
      keys,
      data: new Buffer([0x19])
    });
    transaction.add(depositInstruction);

    if (typeof events.onBeforeSignTransaction === 'function') {
      events.onBeforeSignTransaction();
    }

    setTimeout(async () => {
      try {
        const signedTransaction = await this.solana.signTransaction(transaction);
        const sig = await this.connection.sendRawTransaction(signedTransaction.serialize());
        if (typeof events.onSuccessSign === 'function') events.onSuccessSign(sig);
      } catch (error) {
        if (typeof events.onErrorSign === 'function') events.onErrorSign(error);
      }
    });
  }

  async _createApproveDepositInstruction(amount) {
    const solanaPubkey = this._getSolanaPubkey();
    const source = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(NEON_TOKEN_MINT),
      solanaPubkey
    );
    const authority = await this._getAuthorityPoolAddress();

    return Token.createApproveInstruction(
      TOKEN_PROGRAM_ID,
      source,
      authority,
      solanaPubkey,
      [],
      // @ts-ignore
      Big(amount).times(Big(10).pow(NEON_TOKEN_DECIMALS)).toString()
    );
  }

  async _getAuthorityPoolAddress() {
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

  getEthereumTransactionParams(amount, token) {
    console.log(amount, token);
    return {
      to: '0x053e3d1b12726f648B2e45CEAbDF9078B742576D',
      from: this.neonWalletAddress,
      value: this._computeWithdrawAmountValue(amount, token),
      data: this._computeWithdrawEthTransactionData()
    };
  }

  _computeWithdrawEthTransactionData(): string {
    const withdrawMethodID = '0x8e19899e';
    const solanaPubkey = this._getSolanaPubkey();
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
