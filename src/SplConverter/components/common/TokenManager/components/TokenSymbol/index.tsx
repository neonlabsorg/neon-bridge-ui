import { useEffect, useMemo, useRef, useState } from 'react';
import stub from '@/assets/no_symbol.svg';

export const TokenSymbol = ({ src = '', alt = '', className = '', style = {} }) => {
  const imgRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const currentSource = useMemo(() => failed ? stub : src, [failed]);

  const handleError = () => setFailed(true);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  useEffect(() => {
    if (imgRef.current) {
      const { current } = imgRef;
      current.onerror = handleError;
      return () => (current.onerror = null);
    }
  }, []);

  return <img ref={imgRef} src={currentSource} alt={alt} style={style}
              className={`inline-block ${className ? className : ''}`} />;
};
