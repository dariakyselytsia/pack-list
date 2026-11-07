import { useEffect, useState } from 'react';

/** true only after `value` has stayed true for `delay` ms (avoids flicker). */
export function useDelayedFlag(value: boolean, delay = 1500) {
  const [flag, setFlag] = useState(false);
  useEffect(() => {
    if (!value) {
      setFlag(false);
      return;
    }
    const t = setTimeout(() => setFlag(true), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return flag;
}
