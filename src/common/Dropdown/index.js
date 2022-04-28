import { useEffect, useCallback, useState, useRef } from "react";

export const Dropdown = ({trigger, children}) => {
  const ref = useRef(null)
  const [active, setActive] = useState(false);
  const openDropdown = useCallback(() => setActive(true), [setActive]);

  const closeDropdown = useCallback(() => setActive(false), [setActive]);
  useEffect(() => {
    const listener = (event) => {
        const node = ref.current
        // Do nothing if clicking dropdown or its descendants
        let isDDclick = false
        for (let child of node.childNodes) {
          if (child.contains(event.target)) isDDclick = true
        }
        if (isDDclick) return
        closeDropdown()
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
    };
}, [ref, closeDropdown]);
  return <div className="dropdown" ref={ref}>
    <div onClick={openDropdown} >{trigger}</div>
    <div className={`dropdown__list ${active && 'dropdown__list--active'}`}>
      {children}
    </div>
  </div>
}