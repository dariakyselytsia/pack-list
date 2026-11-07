import { useCallback, useEffect, useRef } from 'react';

/** Debounced function with flush() — pending call runs on flush or unmount. */
export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delay: number) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingArgs = useRef<A | null>(null);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const args = pendingArgs.current;
    pendingArgs.current = null;
    if (args) fnRef.current(...args);
  }, []);

  const call = useCallback(
    (...args: A) => {
      pendingArgs.current = args;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    },
    [delay, flush],
  );

  useEffect(() => flush, [flush]);

  return { call, flush };
}
