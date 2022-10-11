import {
  AccountInfo,
  Cluster,
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction
} from '@solana/web3.js';
import { InstructionEvents } from '@/transfer/models/events';
import { SPLToken } from '@/transfer/models';
import { AccountHex, EvmInstruction } from '@/transfer/data';
import { NeonProxy } from '@/api/proxy';
import Big from 'big.js';
import Web3 from 'web3';
import { Account, TransactionConfig } from 'web3-core';
import { NEON_EVM_LOADER_ID, NEON_TOKEN_MINT } from '../data';
import { SHA256 } from 'crypto-js';

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

  get solana() {
    return window['solana'];
  }

  get ethereum() {
    return window['ethereum'];
  }

  get solanaWalletPubkey() {
    return new PublicKey(this.solanaWalletAddress);
  }

  get emulateSigner(): Account {
    const emulateSignerPrivateKey = `0x${SHA256(this.solanaWalletPubkey.toBase58()).toString()}`;
    return this.web3.eth.accounts.privateKeyToAccount(emulateSignerPrivateKey);
  }

  get neonMintToken() {
    return this.solanaPubkey(NEON_TOKEN_MINT);
  }

  get neonAccountSeed() {
    return this._getEthSeed(this.neonWalletAddress);
  }

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

  bytesFromHex(hex: number): Buffer {
    const hexString = hex.toString(16);
    if (this.isValidHex(hexString)) {
      const hexReplace = hexString.replace(/^0x/i, '');
      const bytes = [];
      for (let c = 0; c < hexReplace.length; c += 2) {
        bytes.push(parseInt(hexReplace.slice(c, c + 2), 16));
      }
      return new Buffer(bytes);
    }
  }

  isValidHex(hex: string | number): boolean {
    const isHexStrict = /^(0x)?[0-9a-f]*$/i.test(hex.toString());
    if (!isHexStrict) {
      throw new Error(`Given value "${hex}" is not a valid hex string.`);
    }
    return isHexStrict;
  }

  async getNeonAccountAddress(): Promise<{ neonAddress: PublicKey, neonNonce: number }> {
    const accountSeed = this.neonAccountSeed;
    const seeds = [new Uint8Array([AccountHex.SeedVersion]), new Uint8Array(accountSeed)];
    const [neonAddress, neonNonce] = await PublicKey.findProgramAddress(seeds, new PublicKey(NEON_EVM_LOADER_ID));
    return { neonAddress, neonNonce };
  }

  _getEthSeed(hex: string): Buffer {
    // @ts-ignore
    hex = hex.toString(16);

    const isHexStrict = (['string', 'number'].includes(typeof hex)) && /^(-)?0x[0-9a-f]*$/i.test(hex);

    if (!isHexStrict) {
      throw new Error(`Given value "${hex}" is not a valid hex string.`);
    }

    hex = hex.replace(/^0x/i, '');
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.slice(c, c + 2), 16));
    }

    return Buffer.from(bytes);
  }

  async getNeonAccount(): Promise<AccountInfo<Buffer>> {
    const { neonAddress } = await this.getNeonAccountAddress();

    return this.connection.getAccountInfo(neonAddress);
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

  async _getNeonAccountInstructionKeys(neonAddress: PublicKey) {
    const solanaWalletPubkey = this.solanaWalletPubkey;

    return [
      { pubkey: solanaWalletPubkey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: neonAddress, isSigner: false, isWritable: true }
    ];
  }

  async createNeonAccountInstructionERC20(neonAddress, neonNonce) {
    const solanaWallet = this.solanaWalletPubkey;
    const keys = [
      { pubkey: solanaWallet, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: neonAddress, isSigner: false, isWritable: true }
    ];

    const pattern = this.bytesFromHex(EvmInstruction.CreateAccountV02); // 0x18 -> 24
    const data = this.mergeTypedArraysUnsafe(this.mergeTypedArraysUnsafe(pattern, this.neonAccountSeed), new Uint8Array([neonNonce]));

    return new TransactionInstruction({ programId: new PublicKey(NEON_EVM_LOADER_ID), keys, data });
  }

  async _createNeonAccountInstruction() {
    const { neonAddress, neonNonce } = await this.getNeonAccountAddress();
    const keys = await this._getNeonAccountInstructionKeys(neonAddress);
    const pattern = this._getEthSeed('0x18');
    const instructionData = this.mergeTypedArraysUnsafe(
      this.mergeTypedArraysUnsafe(new Uint8Array(pattern), this.neonAccountSeed),
      new Uint8Array([neonNonce]));

    return new TransactionInstruction({
      programId: new PublicKey(NEON_EVM_LOADER_ID),
      data: instructionData,
      keys
    });
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

  mergeTypedArraysUnsafe(a, b) {
    const c = new a.constructor(a.length + b.length);
    c.set(a);
    c.set(b, a.length);
    return c;
  }

  emitFunction = (functionName: Function, ...args): void => {
    if (typeof functionName === 'function') {
      functionName(...args);
    }
  };
}
