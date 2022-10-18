import { SPLToken } from 'neon-portal/src/models/token';
import { NEON_TOKEN_MINT_DECIMALS } from 'neon-portal';

export const NEON_TOKEN_MODEL: SPLToken = {
  chainId: 0,
  address_spl: '',
  address: '',
  decimals: NEON_TOKEN_MINT_DECIMALS,
  name: 'Neon',
  symbol: 'NEON',
  logoURI: 'https://raw.githubusercontent.com/neonlabsorg/token-list/main/neon_token_md.png'
};

export const splTokensList = [NEON_TOKEN_MODEL];
