import React, { DetailedHTMLProps, FC, ImgHTMLAttributes } from 'react'
import { Wallet } from '@solana/wallet-adapter-react';

export interface WalletIconProps
  extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  wallet: Wallet | null
}

export const WalletIcon: FC<WalletIconProps> = ({ wallet: {adapter}, ...props }) => {
  return adapter && <img src={adapter.icon} alt={`${adapter.name} icon`} {...props} />
}
