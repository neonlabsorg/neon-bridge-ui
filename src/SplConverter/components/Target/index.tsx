import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWeb3React } from '@web3-react/core';

import Button from '@/common/Button';
import Web3Status from '@/common/Web3Status';
import { WalletModalProvider, WalletMultiButton } from '@/common/SolanaStatus';
import { useStatesContext } from '@/contexts/states';
import { SourceCard } from '@/SplConverter/components/common/SourceCard';
import { TransferInfo } from '@/SplConverter/components/common/TransferInfo';
import { Direction } from '@/contexts/models';

export const Target = () => {
  const { direction, finishStep, depositFee, solBalance } = useStatesContext();
  const { active } = useWeb3React();
  const { publicKey } = useWallet();

  const isDisabled = useMemo(() => {
    return !active || depositFee > solBalance || !publicKey;
  }, [direction, active, depositFee, solBalance, publicKey]);

  return <div className='w-full flex flex-col'>
    <SourceCard direction={direction} prefix='To' className='mb-6' />
    {direction === Direction.solana ?
      <WalletModalProvider><WalletMultiButton children={null} /></WalletModalProvider>
      : direction === Direction.neon ? <Web3Status className='mb-6 self-center' /> : null}
    {active ? <TransferInfo /> : null}
    <Button disabled={isDisabled} onClick={() => finishStep('target')}>Next</Button>
  </div>;
};
