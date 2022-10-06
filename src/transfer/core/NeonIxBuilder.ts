import { AccountMeta, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { etherToProgram } from '@/transfer/utils/address';
import { SignedTransaction, TransactionConfig } from 'web3-core';
import { KECCAK_PROGRAM } from '../data';

export class NeonIxBuilder {
  operatorAccount: PublicKey;
  operatorNeonAddress?: PublicKey;
  ethAccounts: AccountMeta[] = [];
  ethTransaction?: TransactionConfig;
  ethSignedTransaction?: SignedTransaction;
  message?: Uint8Array;
  holderMsg?: Uint8Array;
  collateralPoolIndexBuf?: Uint8Array;
  collateralPoolAddress?: PublicKey;
  storage?: PublicKey;
  holder?: PublicKey;
  permAccsId?: number;

  makeNonIterativeCallTransaction(lengthBefore: number): Transaction {
    const transaction = new Transaction();
    transaction.add();
    return transaction;
  }

  makeKeccakInstruction(checkInstructionIndex: number, messageLength: number, dataStart: number): TransactionInstruction {
    const keys = [];
    const data = Buffer.from([]);
    return new TransactionInstruction({ programId: new PublicKey(KECCAK_PROGRAM), keys, data });
  }

  makeExecTransaction(): TransactionInstruction {
    const keys = [];
    const data = Buffer.from([]);
    return new TransactionInstruction({ programId: new PublicKey(KECCAK_PROGRAM), keys, data });
  }

  initOperatorEther(operatorEther: string): void {
    this.operatorNeonAddress = etherToProgram(operatorEther)[0];
  }

  initEtherTransaction(transaction: TransactionConfig, signed: SignedTransaction): NeonIxBuilder {
    this.ethTransaction = transaction;
    this.ethSignedTransaction = signed;
    const { from } = this.ethTransaction;
    const sender = typeof from === 'number' ? from.toString(16) : from;
    const bSender = Buffer.from(sender, 'hex');
    // https://web3js.readthedocs.io/en/v1.5.2/web3-eth-accounts.html#signtransaction
    // r - First 32 bytes of the signature
    // s - Next 32 bytes of the signature
    // v = Recovery value + 27
    const bSignature = Buffer.from(signed.r.slice(2) + signed.s.slice(2), 'hex');
    const bUnsignedMessage = Buffer.from(signed.messageHash.slice(2), 'hex');
    const message = new Uint8Array(bSender.length + bSignature.length + bUnsignedMessage.length);
    message.set(bSender);
    message.set(bSignature);
    message.set(bUnsignedMessage);
    this.message = message;
    console.log('message', message);

    // web3.utils.keccak256(signed.messageHash);
    return this;
  }

  initEtherAccounts(accounts: AccountMeta[]): void {
    this.ethAccounts = accounts;
  }


  constructor(operator: PublicKey) {
    this.operatorAccount = operator;
  }
}

