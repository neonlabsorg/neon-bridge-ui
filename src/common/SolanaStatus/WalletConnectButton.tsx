import { FC, MouseEventHandler, useCallback, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import { Button, ButtonProps } from './Button';
import { WalletIcon } from './WalletIcon';

export const WalletConnectButton: FC<ButtonProps> = ({ children, disabled, onClick, ...props }) => {
  const { wallet, wallets, connect, connecting, connected, select } = useWallet();

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      if (onClick) onClick(event);
      if (!event.defaultPrevented) connect().catch(() => {
      });
    },
    [onClick, connect]
  );

  useEffect(() => {
    if (!wallet) {
      select(wallets[0].name);
    }
    // eslint-disable-next-line
  }, []);

  const content = useMemo(() => {
    if (children) return children;
    if (connecting) return 'Connecting ...';
    if (connected) return 'Connected';

    return 'Connect Wallet';
  }, [children, connecting, connected]);

  return (
    <Button
      className='wallet-adapter-button-trigger'
      disabled={disabled || !wallet || connecting || connected}
      startIcon={wallet ? <WalletIcon wallet={wallet} /> : undefined}
      onClick={handleClick}
      {...props}
    >
      {content}
    </Button>
  );
};
