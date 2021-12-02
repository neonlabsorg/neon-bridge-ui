import React, { useState } from 'react';


import Connection from './components/Connection'
import Details from './components/Details';
import { Accordion } from './components/Accordion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWeb3React } from '@web3-react/core';

export const SplConverter = () => {
    
    const [direction, setDirection] = useState('neon')
    const [activeStep, setActiveStep] = useState('connection')
    const { connected } = useWallet()
    const { active } = useWeb3React()
    const toggleDirection = () => {
        if (direction === 'neon') setDirection('solana')
        else setDirection('neon')
    }
    return (
        <div className='w-full'>
            <Accordion title={'Connection'}
                className='mb-8'
                active={activeStep === 'connection'}
                onOpenContent={() => setActiveStep('connection')}>
                <Connection direction={direction}
                    className='mb-6'
                    onToggleDirection={toggleDirection}
                    onNextStep={() => setActiveStep('details')}/>
            </Accordion>
            <Accordion title={'Details'}
                stepNumber={2}
                active={activeStep === 'details'}
                onOpenContent={() => {
                    if (!connected || !active) return
                    setActiveStep('details')
                }}>
                <Details direction={direction}/>
            </Accordion>
        </div>

    );
};