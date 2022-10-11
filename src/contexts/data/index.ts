import { SPLToken } from '@/transfer/models';
import { NEON_TOKEN_MINT, NEON_TOKEN_MINT_DECIMALS } from '@/transfer/data';

export const NEON_TOKEN_MODEL: SPLToken = {
  chainId: 0,
  address_spl: NEON_TOKEN_MINT,
  address: '',
  decimals: NEON_TOKEN_MINT_DECIMALS,
  name: 'Neon',
  symbol: 'NEON',
  logoURI: 'https://raw.githubusercontent.com/neonlabsorg/token-list/main/neon_token_md.png'
};

export const CUSTOM_TOKEN_MODEL: SPLToken = {
  chainId: 0,
  address_spl: 'HdvHZXp5F4ZPxb5V7xG4gpBnwmbzMite85NSg3aycmhi',
  address: '0xBdd4cDAf6c9bbb6979d043512e7940f869B06b8C',
  decimals: 6,
  name: 'Wrapped AAVE',
  symbol: 'AAVET',
  logoURI: ''
};

export const splTokensList = [NEON_TOKEN_MODEL, CUSTOM_TOKEN_MODEL];
