import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWeb3React } from '@web3-react/core';
import Button from '@/common/Button';
import { WalletModalProvider, WalletMultiButton } from '@/common/SolanaStatus';
import Web3Status from '@/common/Web3Status';
import { useStatesContext } from '@/contexts/states';
import { CurrencyInput } from '@/SplConverter/components/common/CurrencyInput';
import { SourceCard } from '@/SplConverter/components/common/SourceCard';
import { ReactComponent as ReverseIcon } from '@/assets/reverse.svg';
import { Direction } from '@/contexts/models';

export const Source = ({ className = '' }) => {
  const { direction, toggleDirection, finishStep, amount, token, maxBalance } = useStatesContext();
  const { connected } = useWallet();
  const { active } = useWeb3React();

  const isNeon = useMemo(() => {
    return direction === Direction.neon;
  }, [direction]);

  const isSolana = useMemo(() => {
    return direction === Direction.solana;
  }, [direction]);

  const enabled = useMemo(
    () => (isNeon && connected) || (direction === 'solana' && active),
    [active, connected, direction]
  );

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <div className='flex justify-between items-center mb-6'>
        <div className='sm:w-1/3 xs:w-full flex flex-col'>
          <SourceCard
            prefix='From'
            direction={isNeon ? Direction.solana : isSolana ? Direction.neon : Direction.solana} />
        </div>
        <Button iconed gray onClick={toggleDirection}>
          <ReverseIcon />
        </Button>
        <div className='sm:w-1/3 xs:w-full flex flex-col'>
          <SourceCard direction={direction} prefix='To' />
        </div>
      </div>
      <div className='flex justify-center mb-6'>
        {isNeon ? <WalletModalProvider>
            <WalletMultiButton children={null} />
          </WalletModalProvider> :
          isSolana ? <Web3Status /> : null}
      </div>
      {enabled ? <CurrencyInput className='mb-2' /> : null}
      <Button
        disabled={!enabled || amount === 0 || amount > maxBalance || !token}
        onClick={() => finishStep('source')}>
        Next
      </Button>
    </div>
  );
};
