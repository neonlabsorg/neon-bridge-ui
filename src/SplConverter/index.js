import React, { useState } from 'react';


import Connection from './components/Connection'
import Details from './components/Details';
import { Accordion } from './components/Accordion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWeb3React } from '@web3-react/core';


// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

export const SplConverter = () => {
    
    const [direction] = useState('neon')
    const [activeStep, setActiveStep] = useState('connection')
    const { connected } = useWallet()
    const { active } = useWeb3React()
    return (
        <div className='w-full'>
            <Accordion title={'Connection'}
                className='mb-8'
                active={activeStep === 'connection'}
                onOpenContent={() => setActiveStep('connection')}>
                <Connection direction={direction}
                    className='mb-6'
                    onNextStep={() => setActiveStep('details')}/>
            </Accordion>
            <Accordion title={'Details'}
                stepNumber={2}
                active={activeStep === 'details'}
                onOpenContent={() => {
                    if (!connected || !active) return
                    setActiveStep('details')
                }}>
                <Details
                    className='mb-6'/>
            </Accordion>
        </div>

    );
};