import NewSource from './components/Source/newIndex';

export const SplConverter = () => {
    return <>
      <div className='mb-32'>
        <NewSource></NewSource>
      </div>


      {/*{isFirstTransaction && viewNotify ? (*/}
      {/*  <div className='bg-white dark:bg-dark-600 p-6 mb-4 flex flex-col relative'>*/}
      {/*    <CrossIcon className='absolute right-5 top-5' onClick={() => setViewNotify(false)} />*/}
      {/*    <div className='text-lg mb-2'>Airdrop ahead!</div>*/}
      {/*    <div className='text-sm text-gray-600 leading-relaxed'>*/}
      {/*      When you complete your first Neonpass transaction we will refund half of a price spent*/}
      {/*      to account creation in NEON tokens*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*) : null}*/}
      {/*<div className='w-full'>*/}
      {/*  {Object.keys(steps).map((stepKey, index) => {*/}
      {/*    const step = steps[stepKey];*/}
      {/*    const StepComponent = COMPONENTS_BY_STEPS[stepKey];*/}
      {/*    return <Accordion className='mb-8' key={stepKey} title={step.title} stepKey={stepKey}*/}
      {/*                      stepNumber={index + 1} active={step.status === 'active'}*/}
      {/*                      finished={step.status === 'finished'}*/}
      {/*                      resultsView={<ResultsView stepKey={stepKey} />}>*/}
      {/*      <StepComponent />*/}
      {/*    </Accordion>;*/}
      {/*  })}*/}
      {/*</div>*/}
    </>;
};
