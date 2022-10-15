import { SPLToken } from '@/transfer/models';
import { NEON_TOKEN_MINT, NEON_TOKEN_MINT_DECIMALS } from '@/transfer/data';

export const NEON_TOKEN_MODEL: SPLToken = {
  chainId: 0,
  address_spl: NEON_TOKEN_MINT,
  address: NEON_TOKEN_MINT,
  decimals: NEON_TOKEN_MINT_DECIMALS,
  name: 'Neon',
  symbol: 'NEON',
  logoURI: 'https://raw.githubusercontent.com/neonlabsorg/token-list/main/neon_token_md.png'
};

export const splTokensList = [NEON_TOKEN_MODEL];
