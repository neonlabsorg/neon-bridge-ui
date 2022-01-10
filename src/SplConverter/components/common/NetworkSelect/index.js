import { useState, useMemo } from 'react'
import { ReactComponent as DropDownIcon } from '@/assets/dropdown.svg'
import { ENDPOINTS, useConnectionConfig} from '@/contexts/connection'

const NetworkDropdown = ({className = '', onChoose = () => {}}) => {
  const { endpoint } = useConnectionConfig();
  return <div className={`flex flex-col w-full bg-light-gray ${className}`}>
    {ENDPOINTS.map(network => {
      if (network.endpoint === endpoint) return ''
      return <div key={network.name}
        onClick={onChoose.bind(this, network)}
        className='p-3 w-full border-t border-white'>{network.name}</div>
    })}
  </div>
}

export const NetworkSelect = ({className = ''}) => {
  const [openDD, setOpenDD] = useState(false)
  const { endpoint, setEndpoint } = useConnectionConfig();
  const selected = useMemo(() => ENDPOINTS.find(network => network.endpoint === endpoint)?.name, [endpoint])
  return <div className={`network-select ${className}`}
    style={{
      minWidth: '280px'
    }}
    onClick={() => setOpenDD(!openDD)}>
    <div className={`items-center flex ${selected ? 'justify-between': 'justify-end h-full'}`}>
      <div className='network-select__selected'>
        <span>{selected}</span>
        <DropDownIcon className='ml-3 ' />
      </div>
      
    </div>
    <NetworkDropdown className={`
        absolute left-0 right-0 top-full 
        ${!openDD ? 'opacity-0 pointer-events-none' : ''}
      `}
      onChoose={(network) => {
        setOpenDD(false)
        setEndpoint(network.endpoint)
      }}/>
  </div>
}