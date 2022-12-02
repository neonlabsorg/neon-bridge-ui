import {SourceCard} from "@/SplConverter/components/common/NewSourceCard";
import Change from '@/assets/change.svg'
import {useStatesContext} from "@/contexts/states";
import {useMemo} from "react";
import {Direction} from "@/contexts/models";
import BaseInput from "@/common/BaseInput";

export const Source = ({ className = '' }) => {
  const { direction, toggleDirection } = useStatesContext();

  const walletName = useMemo(() => {
    return direction === Direction.solana
      ? { from: Direction.neon, to: Direction.solana }
      : { from: Direction.solana, to: Direction.neon }
  }, [direction])

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
        <div></div>
        <BaseInput label='Amount' onChange={(string) => { console.log(string)} }>
          <div className='flex justify-between w-full mt-2 ml-4 text-input-hint-text'>
            <div>~$ 0.0</div>
            <div>
              fee 0 NEON
            </div>
          </div>
        </BaseInput>
      </div>
    </div>
  )
}

export default Source
