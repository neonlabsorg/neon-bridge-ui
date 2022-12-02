import {useRef, useState} from "react";
import {createPopper} from "@popperjs/core";
import {useTokensContext} from "@/contexts/tokens";
import {SPLToken} from "neon-portal/dist/models/token";
import {useStatesContext} from "@/contexts/states";

interface TokenSelectorProps {
  disabled: boolean
}

interface TokenItemProps {
  balance?: string;
  token: SPLToken;
  disabled?: boolean;
  onClose?: () => void;
}
export const TokenItem = (props: TokenItemProps) => {
  const { token, balance = '0.0', disabled, onClose } = props;
  const { symbol, logoURI: logo } = token;
  const [hovered, setHovered] = useState(false);
  const { setToken } = useStatesContext();

  const onSelect = () => {
    if (disabled) return;

    setToken(token);
    onClose()
  }

  return (
    <div
      className={`px-4 py-5 select-none cursor-pointer flex w-full ${ hovered ? 'bg-dropdown-item-hovered' : '' }`}
      onMouseEnter={() => disabled ? null : setHovered(true)}
      onMouseLeave={() => disabled ? null : setHovered(false)}
      onClick={() => onSelect()}
    >
      <img className='w-[24px] h-[24px]' src={logo} alt={symbol} />
      <div className={ `${hovered && 'text-dropdown-item-text-hovered '} + ml-[10px]`}> {symbol} </div>
      <div className='ml-auto'> {balance} </div>
    </div>
  )
}
export const TokenSelector = ({ disabled }: TokenSelectorProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropperRef = useRef<HTMLDivElement>();
  const dropdownRef = useRef<HTMLDivElement>();
  const { list } = useTokensContext();
  const { token } = useStatesContext();

  const open = () => {
    createPopper(dropperRef.current, dropdownRef.current, {
      placement: 'bottom-start'
    });

    setShowDropdown(true);
  };
  const onClick = () => {
    if (disabled) return

    showDropdown ? setShowDropdown(false) : open()
  }

  return (
    <div>
      <div className='mb-2 ml-4 text-light-grey tracking-tighten'>
        Choose token
      </div>
      <div
        onClick={onClick}
        ref={dropperRef}
        className={`flex
         rounded-[8px] border border-2 border-transparent
         bg-input-bg hover:bg-input-bg-hover ease-in duration-200
         w-full h-[66px] text-base-2
         ${disabled && '!bg-input-bg-disabled'}
         ${!token && 'px-4 py-5'}
      `}
      >
        { token ?
          <TokenItem disabled={true} token={token}></TokenItem> : <div>Token is not selected</div> }
      </div>
      {
        showDropdown &&
        <div
          className={
            (showDropdown ? "absolute " : "hidden ") +
            `text-base z-50 float-left py-2 list-none text-left rounded shadow-lg mt-1 bg-black overflow-auto`
          }
          ref={dropdownRef}
          style={{
            minWidth: `${dropperRef.current.clientWidth}px`,
            width: `${dropperRef.current.clientWidth}px`,
            maxWidth: `${dropperRef.current.clientWidth}px`,
            maxHeight: '192px'
          }}
        >
          { list.map((token: SPLToken, index) =>
              <TokenItem onClose={() => setShowDropdown(false)} token={token} key={index} balance='0.0' />)
          }
        </div>
      }
    </div>
  )
}

export default TokenSelector
