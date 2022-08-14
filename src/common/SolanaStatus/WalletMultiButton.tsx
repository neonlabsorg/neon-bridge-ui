import { useWallet } from '@solana/wallet-adapter-react'
import { FC, useCallback, useMemo, useState } from 'react'
import { Dropdown } from '@/common/Dropdown'
import { Button, ButtonProps } from './Button'
import { WalletConnectButton } from './WalletConnectButton'

export const WalletMultiButton: FC<ButtonProps> = ({ children, ...props }) => {
  const { publicKey, wallet, disconnect } = useWallet()
  const [copied, setCopied] = useState(false)

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey])
  const content = useMemo(() => {
    if (children) return children
    if (!wallet || !base58) return null
    return base58.slice(0, 4) + '..' + base58.slice(-4)
  }, [children, wallet, base58])

  const copyAddress = useCallback(async () => {
    if (base58) {
      await navigator.clipboard.writeText(base58)
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    }
  }, [base58])

  if (!base58) return <WalletConnectButton {...props}>{children}</WalletConnectButton>

  return (
    <Dropdown
      trigger={
        <Button className='wallet-adapter-button-trigger w-full' {...props}>
          {content}
        </Button>
      }
    >
      <ul aria-label='dropdown-list' role='menu'>
        <li onClick={copyAddress} className='dropdown__item' role='menuitem'>
          {copied ? 'Copied' : 'Copy address'}
        </li>
        <li onClick={disconnect} className='dropdown__item' role='menuitem'>
          Disconnect
        </li>
      </ul>
    </Dropdown>
  )
}
