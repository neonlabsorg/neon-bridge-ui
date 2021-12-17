import React, { useState } from 'react';
import { withNotie } from 'react-notie';
import Connection from './components/Connection'
import Details from './components/Details';
import { Accordion } from './components/Accordion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWeb3React } from '@web3-react/core';


export const SplConverter = withNotie ((props) => {
    
    const [direction, setDirection] = useState('neon')
    const [activeStep, setActiveStep] = useState('connection')
    const { connected, publicKey } = useWallet()
    const { active, account } = useWeb3React()
    const {alert} = props.notie
    const [signedTransfer, setSignedTranster] = useState(null)

    const handleSignTransfer = (signature,  mintToken, amount) => {
        setSignedTranster({signature, fromPublicKey: publicKey.toBase58(), toPublicKey: account, mintToken, amount})
        alert({
            level: 'INFO',
            message: 'Transaction sucessfully signed and sended.'
        })
        setActiveStep('details')
    }

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
                    onSignTransfer={handleSignTransfer}/>
            </Accordion>
            <Accordion title={'Details'}
                stepNumber={2}
                active={activeStep === 'details'}
                onOpenContent={() => {
                    if (!connected || !active) return
                    setActiveStep('details')
                }}>
                <Details direction={direction} signedTransfer={signedTransfer}/>
            </Accordion>
        </div>

    );
})