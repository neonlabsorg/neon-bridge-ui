import React from 'react'
const Accordion = ({
  stepNumber = 1,
  title = '',
  className = '',
  onOpenContent = () => {},
  active = false,
  children = <></>
}) => {
  return <div className={`w-full rounded-xl bg-ocean-blue p-4 ${className}`}>
    <div className='flex w-full'>
      <div className='rounded-full bg-blue-700 text-white flex items-center justify-center mt-4 mr-4' style={{
        width: '27px',
        minWidth: '27px',
        height: '27px'
      }}>{stepNumber}</div>
      <div className='flex flex-col flex-grow'>
        <h3 className={`text-2xl pb-3 pt-4 ${!active ? 'cursor-pointer' : ''}`}
          onClick={onOpenContent}>{title}</h3>
        {active ? children : null}
      </div>
    </div>
  </div>
}
export { Accordion }