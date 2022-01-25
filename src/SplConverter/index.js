import { Accordion } from './components/common/Accordion'
import { Source } from './components/Source';
import { useStatesContext } from '../contexts/states';
import { Target } from './components/Target';
import { Confirm } from './components/Confirm';
import { shortenAddress } from '../utils';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react'
import { Transfering } from './components/Transfering';
import { useWallet } from '@solana/wallet-adapter-react';
const COMPONENTS_BY_STEPS = {
    source: Source,
    target: Target,
    confirm: Confirm
}

const ResultsView = ({stepKey = ''}) => {
    const { publicKey } = useWallet()
    const { account } = useWeb3React()
    const { amount, splToken, direction } = useStatesContext()
    const shortNeonKey = useMemo(() => shortenAddress(account), [account])
    const shortSolanaKey = useMemo(() => publicKey ? shortenAddress(publicKey.toString()) : '', [publicKey])
    console.log(splToken, amount, direction, account, publicKey, shortSolanaKey, shortNeonKey)
    const renderTransferInfo = () => {
        return <div>
            <span>Transfer </span>
            <span>{`${amount} `}</span>
            <span className='text-blue-500'>{`${splToken.symbol} `}</span>
            <span>from </span>
            <span className='text-blue-500'>{`${direction === 'neon' ? 
                shortSolanaKey :
                shortNeonKey} `}</span>
            <span>{`on ${direction === 'neon' ? 'Solana' : 'Neon'}`}</span>
        </div>
    }
    const renderRecieveInfo = () => {
        return <div>
            <span>Recieve </span>
            <span className='text-blue-500'>{`${splToken.symbol} `}</span>
            <span>to </span>
            <span className='text-blue-500'>{`${direction === 'neon' ? shortNeonKey : shortSolanaKey} `}</span>
            <span>{`on ${direction === 'neon' ? 'Neon' : 'Solana'}`}</span>
        </div>
    }
    if (stepKey === 'source') return renderTransferInfo()
    else if (stepKey === 'target') return renderRecieveInfo()
}


export const SplConverter =  () => {
    const { steps, transfering, neonTransferSign, solanaTransferSign } = useStatesContext()
    if (transfering === true || solanaTransferSign || neonTransferSign) {
        return <Transfering />
    } else {
        return (
            <div className='w-full'>
                {Object.keys(steps).map((stepKey, index) => {
                    const step = steps[stepKey]
                    const StepComponent = COMPONENTS_BY_STEPS[stepKey]
                    return <Accordion className='mb-8' key={stepKey}
                        title={step.title}
                        stepKey={stepKey}
                        stepNumber={index + 1}
                        active={step.status === 'active'}
                        finished={step.status === 'finished'}
                        resultsView={<ResultsView stepKey={stepKey} />}>
                        <StepComponent/>
                    </Accordion>
                })}
            </div>
        )
    }
}