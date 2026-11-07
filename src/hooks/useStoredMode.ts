import { useCallback, useState } from 'react';
import type { Mode } from '../data/types';

const KEY = 'pack-list:mode';
const MODES: readonly Mode[] = ['her', 'his', 'both'];

function read(): Mode {
  try {
    const v = localStorage.getItem(KEY);
    if (v && (MODES as readonly string[]).includes(v)) return v as Mode;
  } catch {
    /* storage blocked */
  }
  return 'her';
}

export function useStoredMode() {
  const [mode, setModeState] = useState<Mode>(read);
  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    try {
      localStorage.setItem(KEY, m);
    } catch {
      /* storage blocked */
    }
  }, []);
  return [mode, setMode] as const;
}
