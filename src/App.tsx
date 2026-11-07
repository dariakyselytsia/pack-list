import { lazy, Suspense } from 'react';
import type { Mode } from './data/types';
import { DESIGNS, type DesignId, type DesignProps } from './designs/types';
import { useLists } from './hooks/useLists';
import { useStoredChoice } from './hooks/useStoredChoice';
import { useDelayedFlag } from './hooks/useDelayedFlag';
import RetroApp from './designs/retro/RetroApp';

// The classic design is loaded only when someone switches to it.
const ClassicApp = lazy(() => import('./designs/classic/ClassicApp'));

const MODES: readonly Mode[] = ['her', 'his', 'both'];

export default function App() {
  const [design, setDesign] = useStoredChoice<DesignId>('pack-list:design', DESIGNS, 'retro');
  const [mode, setMode] = useStoredChoice<Mode>('pack-list:mode', MODES, 'her');
  const { state, actions, writeError, clearWriteError } = useLists();
  const offline = useDelayedFlag(state.status === 'ready' && state.offline);
  const pending = useDelayedFlag(state.status === 'ready' && state.pending);

  const props: DesignProps = {
    mode,
    setMode,
    switchDesign: () => setDesign(design === 'retro' ? 'classic' : 'retro'),
    state,
    actions,
    sync: { offline, pending },
    writeError,
    clearWriteError,
  };

  return design === 'classic' ? (
    <Suspense fallback={null}>
      <ClassicApp {...props} />
    </Suspense>
  ) : (
    <RetroApp {...props} />
  );
}
