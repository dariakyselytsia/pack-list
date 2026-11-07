import { useCallback, useState } from 'react';
import type { ListId } from '../data/types';

interface PanelState {
  /** id of the section shown on the deck */
  sec: string | null;
  /** "УСІ РОЗД." — show every section in one list */
  all: boolean;
}

const key = (id: ListId) => `pack-list:panel:${id}`;

function read(id: ListId): PanelState {
  try {
    const v = JSON.parse(localStorage.getItem(key(id)) ?? 'null');
    if (v && typeof v === 'object') return { sec: typeof v.sec === 'string' ? v.sec : null, all: !!v.all };
  } catch {
    /* storage blocked or bad JSON */
  }
  return { sec: null, all: false };
}

/** Per-list view state, remembered on this device. */
export function usePanelState(id: ListId) {
  const [state, setState] = useState<PanelState>(() => read(id));
  const update = useCallback(
    (patch: Partial<PanelState>) =>
      setState((prev) => {
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem(key(id), JSON.stringify(next));
        } catch {
          /* storage blocked */
        }
        return next;
      }),
    [id],
  );
  return [state, update] as const;
}
