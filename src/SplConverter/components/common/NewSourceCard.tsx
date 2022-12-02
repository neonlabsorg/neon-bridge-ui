import SolanaLogo from '@/assets/solana-logo.svg'
import NeonLogo from '@/assets/neon-logo.svg'
import CheckRounded from '@/assets/check-rounded.svg'
import DisconnectLogo from '@/assets/disconnect.svg'

import {useWeb3React} from "@web3-react/core";
import {injected} from "@/connectors";
import {useWallet} from "@solana/wallet-adapter-react";
import {useEffect, useState} from "react";

interface SourceCardProps {
  direction: 'from' | 'to';
  wallet: 'solana' | 'neon';
  className?: string;
}

type WalletMapper = {
  [key in 'solana' | 'neon']: {
    img: string;
    connected: boolean;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
  };
};

const WalletConnectedState = ({ walletName }: { walletName: string }) => {
  return (
    <div className='flex justify-between'>
      {walletName}
      <img src={CheckRounded} alt=""/>
    </div>
  )
}

export const SourceCard = ({ direction, wallet, className = '' }: SourceCardProps) => {
  const [hovered, setHovered] = useState(false)
  const { active, account, activate, deactivate } = useWeb3React();
  const { wallet: solanaWallet, wallets, select, connect, disconnect, connected } = useWallet();

  const walletMapper: WalletMapper = {
    solana: {
      img: SolanaLogo,
      connect: connectSolana,
      disconnect: disconnectSolana,
      connected: connected,
    },
    neon: {
      img: NeonLogo,
      connect: connectWeb3,
      disconnect: disconnectWeb3,
      connected: !!(active && account)
    },
  }

  async function connectSolana() {
    try {
      await connect()
    } catch (e) {
      console.error(e)
    }
  }

  async function disconnectSolana() {
    try {
      await disconnect()
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (!solanaWallet) {
      select(wallets[0].adapter.name);
    }
    // eslint-disable-next-line
  }, []);

  async function connectWeb3() {
    try {
      await activate(injected);
    } catch (e) {
      console.error(e);
    }
  }

  async function disconnectWeb3() {
    try {
      await deactivate();
    } catch (e) {
      console.error(e);
    }
  }
  const stringCapitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <div className={`${className} select-none cursor-pointer`}>
      <div className='mb-2 ml-4 text-light-grey tracking-tighten'>
        {stringCapitalize(direction)}
      </div>
      <div
        className='px-4 py-5 rounded-[8px] bg-input-bg hover:bg-input-bg-hover ease-in duration-200 w-full h-[66px] text-base-2'
        onMouseEnter={() => {
          setHovered(true)
        }}
        onMouseLeave={() => {
          setHovered(false)
        }}
      >
        {
          hovered && walletMapper[wallet].connected
            ? <div onClick={walletMapper[wallet].disconnect} className='w-full text-center flex justify-center items-center text-light-grey -mt-1'>
                <img className='mr-2' src={DisconnectLogo} alt=""/>
                Disconnect
              </div>
            : <div className='w-full flex'>
                <img src={walletMapper[wallet].img} alt=""/>
                <div className='ml-[34px] w-full'>
                  {
                    walletMapper[wallet].connected
                      ? <WalletConnectedState walletName={stringCapitalize(wallet)} />
                      : <div onClick={walletMapper[wallet].connect}>
                        Connect Wallet
                      </div>
                  }
                </div>
              </div>
        }
      </div>
    </div>
  )
}
