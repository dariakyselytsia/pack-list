import { useCallback, useState } from 'react';

/** A string choice remembered in localStorage (falls back silently if blocked). */
export function useStoredChoice<T extends string>(key: string, allowed: readonly T[], fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const v = localStorage.getItem(key);
      if (v && (allowed as readonly string[]).includes(v)) return v as T;
    } catch {
      /* storage blocked */
    }
    return fallback;
  });
  const set = useCallback(
    (v: T) => {
      setValue(v);
      try {
        localStorage.setItem(key, v);
      } catch {
        /* storage blocked */
      }
    },
    [key],
  );
  return [value, set] as const;
}
