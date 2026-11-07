import type { Mode } from '../data/types';
import type { ListActions, ListsState } from '../hooks/useLists';

export type DesignId = 'retro' | 'classic';
export const DESIGNS: readonly DesignId[] = ['retro', 'classic'];

/** Everything a design needs; data and preferences are shared between designs. */
export interface DesignProps {
  mode: Mode;
  setMode: (m: Mode) => void;
  switchDesign: () => void;
  state: ListsState;
  actions: ListActions;
  /** offline / saving indicators, already debounced against flicker */
  sync: { offline: boolean; pending: boolean };
  writeError: string | null;
  clearWriteError: () => void;
}
