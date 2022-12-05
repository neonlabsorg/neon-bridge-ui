import {SourceCard} from "@/SplConverter/components/common/NewSourceCard";
import Change from '@/assets/change.svg'
import {useStatesContext} from "@/contexts/states";
import {useMemo} from "react";
import {Direction} from "@/contexts/models";
import BaseCurrencyInput from "@/common/BaseCurrencyInput";
import TokenSelector from "@/SplConverter/components/common/TokenSelector";
import {useWallet} from "@solana/wallet-adapter-react";
import {useWeb3React} from "@web3-react/core";

export const Source = ({ className = '' }) => {
  const { direction, toggleDirection, token } = useStatesContext();
  const { connected: solanaWalletConnected } = useWallet();
  const { active, account } = useWeb3React();

  const walletName = useMemo(() => {
    return direction === Direction.solana
      ? { from: Direction.neon, to: Direction.solana }
      : { from: Direction.solana, to: Direction.neon }
  }, [direction]);

  const isWalletConnected = (active && account) && solanaWalletConnected;

  return(
    <div className={`${className}`}>
      <div className='grid grid-cols-7'>
        <SourceCard className='col-start-1 col-end-4' direction='from' wallet={walletName.from} />

        <div onClick={toggleDirection} className='col-start-4 col-end-5 text-center flex mx-auto mt-7 cursor-pointer'>
          <img src={Change} alt=""/>
        </div>

        <SourceCard className='col-start-5 col-end-8' direction='to' wallet={walletName.to} />
      </div>

      <div className='grid grid-cols-2 gap-[10px] mt-[25px]'>
        <TokenSelector disabled={!isWalletConnected} />
        <BaseCurrencyInput
          disabled={!isWalletConnected || !token}
          label='Amount'
        >
          <div className='flex justify-between w-full mt-2 ml-4 text-input-hint-text'>
            <div>~$ 0.0</div>
            <div>
              fee 0 NEON
            </div>
          </div>
        </BaseCurrencyInput>
      </div>
    </div>
  )
}

export default Source
