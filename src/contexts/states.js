import { createContext, useContext, useEffect, useState, useRef } from "react";
const STEPS = {
  source: {
    title: 'Source',
    status: 'active'
  },
  target: {
    title: 'Target',
    status: 'next'
  },
  confirm: {
    title: 'Confirmation',
    status: 'next'
  }
}
export const StateContext = createContext({
  steps: {},
  transfering: false,
  splToken: undefined,
  amount: 0,
  direction: 'neon',
  toggleDirection: () => {},
  finishStep: () => {}
});


export function StateProvider({ children = undefined}) {
  const [amount, setAmount] = useState(0.0)
  const [pending, setPending] = useState(false)
  const [transfering, setTransfering] = useState(false)
  const [solanaTransferSign, setSolanaTransferSign] = useState('')
  const [neonTransferSign, setNeonTransferSign] = useState('')
  const [error, setError] = useState(undefined)
  const [splToken, setSplToken] = useState(undefined)
  const [steps, setSteps] = useState(STEPS)
  const [direction, setDirection] = useState('neon')
  const rejected = useRef(false)
  const toggleDirection = () => {
    if (direction === 'neon') setDirection('solana')
    else setDirection('neon')
  }
  const resetSteps = () => {
    setSteps({
      source: {
        title: 'Source',
        status: 'active'
      },
      target: {
        title: 'Target',
        status: 'next'
      },
      confirm: {
        title: 'Confirmation',
        status: 'next'
      }
    })
  }
  const finishStep = (stepKey = '') => {
    let activeIndex = null
    const currentSteps = Object.assign({}, steps);
    Object.keys(currentSteps).forEach((curKey, index) => {
      if (curKey === stepKey && currentSteps[curKey].status === 'active') {
        activeIndex = index
      }
    })
    if (activeIndex !== null) {
      Object.keys(currentSteps).forEach((key, index) => {
        if (index <= activeIndex && currentSteps[key].status !== 'finished') {
          currentSteps[key].status = 'finished'
        }
        if (index === activeIndex + 1) {
          currentSteps[key].status = 'active'
        }
      })
    }
    setSteps(currentSteps)
  }
  const setStepActive = (stepKey = '') => {
    let activeIndex = null
    const currentSteps = Object.assign({}, steps);
    Object.keys(currentSteps).forEach((curKey, index) => {
      if (curKey === stepKey) {
        const step = currentSteps[curKey];
        if (step.status === 'next' || step.status === 'active') return;
        else {
          activeIndex = index
          step.status = 'active';
        }
      }
    })
    Object.keys(currentSteps).forEach((curKey, index) => {
      if (index > activeIndex) currentSteps[curKey].status = 'next'
    })
    setSteps(currentSteps)
  }
  const resetStates = () => {
    setSolanaTransferSign('')
    setNeonTransferSign('')
    resetSteps()
    rejected.current = false
    console.log('pending false by reset')
    setPending(false)
    setTransfering(false)
    setAmount(0)
    setSplToken(undefined)
  }
  useEffect(() => {
    if (error !== undefined) setError(undefined)
  // eslint-disable-next-line
  }, [amount, splToken])

  useEffect(() => {
    if (rejected.current === true && pending === true) {
      console.log('pending false by reject')
      setPending(false)
    }
  // eslint-disable-next-line
  }, [rejected.current])

  return <StateContext.Provider
    value={{
      steps,
      finishStep,
      setStepActive,
      resetSteps,
      direction,
      toggleDirection,
      amount, setAmount,
      splToken, setSplToken,
      error, setError,
      transfering, setTransfering,
      solanaTransferSign, setSolanaTransferSign,
      neonTransferSign, setNeonTransferSign,
      rejected, resetStates,
      pending, setPending
    }}>
    {children}
  </StateContext.Provider>
}

export function useStatesContext() {
  return useContext(StateContext)
}