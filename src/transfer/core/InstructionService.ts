import {
  Cluster,
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction
} from '@solana/web3.js';
import { InstructionEvents } from '@/transfer/models/events';
import { NEON_EVM_LOADER_ID, NEON_TOKEN_MINT } from '../constants';
import Big from 'big.js';
import { SPLToken } from '@/transfer/models';

Big.PE = 42;

function mergeTypedArraysUnsafe(a, b) {
  const c = new a.constructor(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
}

const noop = () => {
};

export class InstructionService {
  network: Cluster;
  solanaWalletAddress: string;
  neonWalletAddress: string;
  connection: Connection;
  events: InstructionEvents;

  get solana() {
    return window['solana'];
  }

  get ethereum() {
    return window['ethereum'];
  }

  constructor(options) {
    this.network = 'mainnet-beta';
    if (this._isCorrectNetworkOption(options.network)) {
      this.network = options.network;
    }
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

  async _getNeonAccountAddress() {
    const accountSeed = this._getNeonAccountSeed();
    const programAddress = await PublicKey.findProgramAddress(
      [new Uint8Array([1]), new Uint8Array(accountSeed)],
      new PublicKey(NEON_EVM_LOADER_ID)
    );
    const neonAddress = programAddress[0];
    const neonNonce = programAddress[1];

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

  _getNeonAccountSeed() {
    return this._getEthSeed(this.neonWalletAddress);
  }

  async getNeonAccount() {
    const { neonAddress } = await this._getNeonAccountAddress();

    return this.connection.getAccountInfo(neonAddress);
  }

  _getSolanaWalletPubkey() {
    return new PublicKey(this.solanaWalletAddress);
  }

  _isCorrectNetworkOption(network = '') {
    return ['mainnet-beta', 'testnet', 'devnet'].includes(network);
  }

  _getSolanaPubkey(address = ''): PublicKey {
    try {
      return new PublicKey(address);
    } catch (e) {
    }
    return this._getSolanaWalletPubkey();
  }

  _getNeonMintTokenPubkey() {
    return this._getSolanaPubkey(NEON_TOKEN_MINT);
  }

  async _getNeonAccountInstructionKeys(neonAddress: PublicKey) {
    const solanaWalletPubkey = this._getSolanaWalletPubkey();

    return [
      { pubkey: solanaWalletPubkey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: neonAddress, isSigner: false, isWritable: true }
    ];
  }

  async _createNeonAccountInstruction() {
    const { neonAddress, neonNonce } = await this._getNeonAccountAddress();
    const keys = await this._getNeonAccountInstructionKeys(neonAddress);
    const pattern = this._getEthSeed('0x18');
    const instructionData = mergeTypedArraysUnsafe(
      mergeTypedArraysUnsafe(new Uint8Array(pattern), this._getNeonAccountSeed()),
      new Uint8Array([neonNonce]));

    return new TransactionInstruction({
      programId: new PublicKey(NEON_EVM_LOADER_ID),
      data: instructionData,
      keys
    });
  }

  _computeWithdrawEthTransactionData(amount: number, splToken: SPLToken): string {
    const approveSolanaMethodID = '0x93e29346';
    const solanaPubkey = this._getSolanaPubkey();
    // @ts-ignore
    const solanaStr = solanaPubkey.toBytes().toString('hex');
    const amountUnit = Big(amount).times(Big(10).pow(splToken.decimals));
    const amountStr = BigInt(amountUnit).toString(16).padStart(64, '0');

    return `${approveSolanaMethodID}${solanaStr}${amountStr}`;
  }

  getEthereumTransactionParams(amount: number, token: SPLToken) {
    return {
      to: token.address, // Required except during contract publications.
      from: this.neonWalletAddress, // must match user's active address.
      value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      data: this._computeWithdrawEthTransactionData(amount, token)
    };
  }
}
