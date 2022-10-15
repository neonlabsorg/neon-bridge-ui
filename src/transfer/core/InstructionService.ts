import {
  AccountInfo,
  Cluster,
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction
} from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import Big from 'big.js';
import Web3 from 'web3';
import { Account, TransactionConfig } from 'web3-core';
import { SHA256 } from 'crypto-js';
import { InstructionEvents } from '@/transfer/models/events';
import { SPLToken } from '@/transfer/models';
import { NeonProxy } from '@/api/proxy';
import { etherToProgram, toFullAmount } from '@/transfer/utils/address';
import { NEON_EVM_LOADER_ID } from '../data';

Big.PE = 42;

const noop = new Function();

export class InstructionService {
  network: Cluster;
  solanaWalletAddress: PublicKey;
  neonWalletAddress: string;
  web3: Web3;
  proxyApi: NeonProxy;
  connection: Connection;
  events: InstructionEvents;

  constructor(options) {
    this.network = 'mainnet-beta';
    if (this.isCorrectNetworkOption(options.network)) {
      this.network = options.network;
    }
    this.web3 = options.web3;
    this.proxyApi = options.proxyApi;
    this.solanaWalletAddress = options.solanaWalletAddress || '';
    this.neonWalletAddress = options.neonWalletAddress || '';
    this.connection = options.customConnection instanceof Connection ?
      options.customConnection : new Connection(clusterApiUrl(this.network));
    this.events = {
      onBeforeCreateInstruction: options.onBeforeCreateInstruction || noop,
      onCreateNeonAccountInstruction: options.onCreateNeonAccountInstruction || noop,
      onBeforeSignTransaction: options.onBeforeSignTransaction || noop,
      onBeforeNeonSign: options.onBeforeNeonSign || noop,
      onSuccessSign: options.onSuccessSign || noop,
      onErrorSign: options.onErrorSign || noop
    };
  }

  get solana() {
    return window['solana'];
  }

  get ethereum() {
    return window['ethereum'];
  }

  get solanaWalletPubkey(): PublicKey {
    return new PublicKey(this.solanaWalletAddress);
  }

  get solanaWalletSigner(): Account {
    const emulateSignerPrivateKey = `0x${SHA256(this.solanaWalletPubkey.toBase58()).toString()}`;
    return this.web3.eth.accounts.privateKeyToAccount(emulateSignerPrivateKey);
  }

  get neonAccountAddress(): Promise<[PublicKey, number]> {
    return etherToProgram(this.neonWalletAddress);
  }

  async getNeonAccount(neonAssociatedKey: PublicKey): Promise<AccountInfo<Buffer>> {
    return this.connection.getAccountInfo(neonAssociatedKey);
  }

  isCorrectNetworkOption(network = ''): boolean {
    return ['mainnet-beta', 'testnet', 'devnet'].includes(network);
  }

  solanaPubkey(address?: string): PublicKey {
    if (address?.length) {
      try {
        return new PublicKey(address);
      } catch (e) {
        //
      }
    }
    return this.solanaWalletPubkey;
  }

  async neonAccountInstruction(): Promise<TransactionInstruction> {
    const [neonAddress, neonNonce] = await this.neonAccountAddress;
    const keys = [
      { pubkey: this.solanaWalletPubkey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: neonAddress, isSigner: false, isWritable: true }
    ];
    const a = new Uint8Array([0x18]);
    const b = Buffer.from(this.neonWalletAddress, 'hex');
    const c = new Uint8Array([neonNonce]);
    const data = Buffer.concat([a, b, c]);
    return new TransactionInstruction({
      programId: new PublicKey(NEON_EVM_LOADER_ID),
      data,
      keys
    });
  }

  async approveDepositInstruction(solanaPubkey: PublicKey, neonPDAPubkey: PublicKey, token: SPLToken, amount: number): Promise<{ associatedTokenAddress, createApproveInstruction }> {
    const fullAmount = toFullAmount(amount, token.decimals);
    const associatedTokenAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(token.address_spl),
      solanaPubkey
    );

    const createApproveInstruction = Token.createApproveInstruction(
      TOKEN_PROGRAM_ID,
      associatedTokenAddress,
      neonPDAPubkey,
      solanaPubkey,
      [],
      // @ts-ignore
      fullAmount.toString(10)
    );

    return { associatedTokenAddress, createApproveInstruction };
  }

  _computeWithdrawEthTransactionData(amount: number, splToken: SPLToken): string {
    const approveSolanaMethodID = '0x93e29346';
    const solanaPubkey = this.solanaWalletPubkey;
    // @ts-ignore
    const solanaStr = solanaPubkey.toBytes().toString('hex');
    const amountUnit = Big(amount).times(Big(10).pow(splToken.decimals));
    const amountStr = BigInt(amountUnit).toString(16).padStart(64, '0');

    return `${approveSolanaMethodID}${solanaStr}${amountStr}`;
  }

  getEthereumTransactionParams(amount: number, token: SPLToken): TransactionConfig {
    return {
      to: token.address, // Required except during contract publications.
      from: this.neonWalletAddress, // must match user's active address.
      value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      data: this._computeWithdrawEthTransactionData(amount, token)
    };
  }

  emitFunction = (functionName: Function, ...args): void => {
    if (typeof functionName === 'function') {
      functionName(...args);
    }
  };
}
