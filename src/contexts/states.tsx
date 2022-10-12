import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWeb3React } from '@web3-react/core';
import { NEON_TOKEN_DECIMALS } from '@/transfer/data';
import { useTransfering } from '@/SplConverter/hooks/transfering';
import { Direction } from '@/contexts/models';
import { SPLToken } from '@/transfer/models';
import { useConnection } from './connection';
import { useTokensContext } from './tokens';

const STEPS = {
  source: { title: 'Source', status: 'active' },
  target: { title: 'Target', status: 'next' },
  confirm: { title: 'Confirmation', status: 'next' }
};

const rowSteps = JSON.stringify(STEPS);

const ERC20_GAS_DECIMALS = 18;
export const StateContext = createContext({
  steps: {},
  token: undefined,
  amount: 0,
  depositFee: 0,
  direction: Direction.neon,
  theme: 'light',
  toggleTheme: () => {
  },
  toggleDirection: () => {
  },
  finishStep: () => {
  }
});

export function StateProvider({ children = undefined }) {
  const connection = useConnection();
  const { updateTokenList, balances } = useTokensContext();
  const { publicKey } = useWallet();
  const { account, library } = useWeb3React();
  const [amount, setAmount] = useState(0.0);
  const [depositFee, setDepositFee] = useState(0);
  const [withdrawFee, setWithdrawFee] = useState(0);
  const [solBalance, setSolBalance] = useState<string>('0');
  const [pending, setPending] = useState(false);
  const [solanaTransferSign, setSolanaTransferSign] = useState('');
  const [neonTransferSign, setNeonTransferSign] = useState('');
  const [error, setError] = useState(null);
  const [token, setToken] = useState<SPLToken>(null);
  const [steps, setSteps] = useState(JSON.parse(rowSteps));
  const [direction, setDirection] = useState<Direction>(Direction.neon);
  const [theme, setTheme] = useState('light');
  const rejected = useRef(false);
  const { getEthereumTransactionParams } = useTransfering();
  const toggleDirection = () => setDirection(direction === Direction.neon ? Direction.solana : Direction.neon);
  const resetSteps = () => setSteps(JSON.parse(rowSteps));

  const maxBalance = useMemo(() => {
    if (balances && token && balances[token.symbol]) {
      return balances[token.symbol][direction]
    } else return 0
  }, [token, balances, direction])

  const finishStep = (stepKey = '') => {
    let activeIndex = null;
    const currentSteps = Object.assign({}, steps);
    Object.keys(currentSteps).forEach((curKey, index) => {
      if (curKey === stepKey && currentSteps[curKey].status === 'active') {
        activeIndex = index;
      }
    });
    if (activeIndex !== null) {
      Object.keys(currentSteps).forEach((key, index) => {
        if (index <= activeIndex && currentSteps[key].status !== 'finished') {
          currentSteps[key].status = 'finished';
        }
        if (index === activeIndex + 1) {
          currentSteps[key].status = 'active';
        }
      });
    }
    setSteps(currentSteps);
  };
  const setStepActive = (stepKey = '') => {
    let activeIndex = null;
    const currentSteps = Object.assign({}, steps);
    Object.keys(currentSteps).forEach((curKey, index) => {
      if (curKey === stepKey) {
        const step = currentSteps[curKey];
        if (step.status === 'next' || step.status === 'active') return;
        else {
          activeIndex = index;
          step.status = 'active';
        }
      }
    });
    Object.keys(currentSteps).forEach((curKey, index) => {
      if (index > activeIndex) {
        currentSteps[curKey].status = 'next';
      }
    });
    setSteps(currentSteps);
  };
  const toggleTheme = () => {
    const { classList } = document.documentElement;
    if (theme === 'light') {
      classList.add('dark');
      setTheme('dark');
    } else {
      classList.remove('dark');
      setTheme('light');
    }
  };
  const resetStates = () => {
    setSolanaTransferSign('');
    setNeonTransferSign('');
    resetSteps();
    rejected.current = false;
    setPending(false);
    setAmount(0);
    setToken(null);
    // for autoupdate balances after transfering
    setTimeout(() => {
      if (typeof updateTokenList === 'function') {
        updateTokenList();
      }
    }, 5000);
  };
  const calculatingSolBalances = async () => {
    const { feeCalculator } = await connection.getRecentBlockhash();
    setDepositFee(feeCalculator.lamportsPerSignature / Math.pow(10, NEON_TOKEN_DECIMALS));
    const balance = await connection.getBalance(publicKey).catch(console.log);
    setSolBalance((Number(balance) / Math.pow(10, NEON_TOKEN_DECIMALS)).toFixed(9));
  };
  const calculatingEthBalances = async () => {
    try {
      const instruction = getEthereumTransactionParams(amount, token);
      const gasPriceStr = await library.eth.getGasPrice();
      const res = await library.eth.estimateGas(instruction);
      // @ts-ignore
      setWithdrawFee(((res * Number(gasPriceStr)) / Math.pow(10, ERC20_GAS_DECIMALS)).toFixed(9));
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    async function main() {
      if (publicKey) await calculatingSolBalances();
    }

    main();
  }, [publicKey]);

  useEffect(() => {
    async function main() {
      if (account && token && amount && publicKey) {
        await calculatingEthBalances();
      }
    }

    main();
  }, [account, token, amount, publicKey]);

  useEffect(() => {
    if (error !== undefined) {
      setError(undefined);
    }
    // eslint-disable-next-line
  }, [amount, token]);

  useEffect(() => {
    if (rejected.current === true && pending === true) {
      console.log('pending false by reject');
      setPending(false);
    }
    // eslint-disable-next-line
  }, [rejected.current]);

  return (
    <StateContext.Provider
      value={{
        steps,
        finishStep,
        // @ts-ignore
        setStepActive,
        resetSteps,
        direction,
        theme,
        toggleTheme,
        toggleDirection,
        amount,
        setAmount,
        token,
        setToken,
        error,
        setError,
        solanaTransferSign,
        setSolanaTransferSign,
        neonTransferSign,
        setNeonTransferSign,
        rejected,
        resetStates,
        pending,
        setPending,
        depositFee,
        solBalance,
        withdrawFee,
        maxBalance
      }}>
      {children}
    </StateContext.Provider>
  );
}

export function useStatesContext(): any {
  return useContext(StateContext);
}
