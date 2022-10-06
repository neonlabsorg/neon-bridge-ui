import { PublicKey } from '@solana/web3.js';
import { NEON_EVM_LOADER_ID, NEON_SEED_VERSION } from '@/transfer/data';
import { Buffer } from 'buffer';

export function isValidHex(hex: string | number): boolean {
  const isHexStrict = /^(0x)?[0-9a-f]*$/i.test(hex.toString());
  if (!isHexStrict) {
    throw new Error(`Given value "${hex}" is not a valid hex string.`);
  }
  return isHexStrict;
}

export async function etherToProgram(etherKey: string): Promise<[PublicKey, number]> {
  const keyBuffer = Buffer.from(isValidHex(etherKey) ? etherKey.replace(/^0x/i, '') : etherKey, 'hex');
  const seed = [new Uint8Array(NEON_SEED_VERSION), new Uint8Array(keyBuffer)];
  const [pda, nonce] = await PublicKey.findProgramAddress(seed, new PublicKey(NEON_EVM_LOADER_ID));
  return [pda, nonce];
}

export function mergeTypedArraysUnsafe(a, b) {
  const c = new a.constructor(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
}
