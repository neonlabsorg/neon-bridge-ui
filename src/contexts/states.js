import { createContext, useContext, useState } from "react";
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
  direction: 'neon',
  toggleDirection: () => {},
  finishStep: () => {}
});


export function StateProvider({ children = undefined}) {
  const [amount, setAmount] = useState(0.0)
  const [splToken, setSplToken] = useState({})
  const [steps, setSteps] = useState(STEPS)
  const [direction, setDirection] = useState('neon')
  const toggleDirection = () => {
    
    if (direction === 'neon') setDirection('solana')
    else setDirection('neon')
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
  return <StateContext.Provider
    value={{
      steps,
      finishStep,
      setStepActive,
      direction,
      toggleDirection,
      amount, setAmount,
      splToken, setSplToken
    }}>
    {children}
  </StateContext.Provider>
}

export function useStatesContext() {
  return useContext(StateContext)
}