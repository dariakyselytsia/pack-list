import { lazy, Suspense } from 'react';
import type { Mode } from './data/types';
import { DESIGNS, type DesignId, type DesignProps } from './designs/types';
import { useLists } from './hooks/useLists';
import { useStoredChoice } from './hooks/useStoredChoice';
import { useDelayedFlag } from './hooks/useDelayedFlag';
import RetroApp from './designs/retro/RetroApp';

// Non-default designs are loaded only when someone switches to them.
const ClassicApp = lazy(() => import('./designs/classic/ClassicApp'));
const MatrixApp = lazy(() => import('./designs/matrix/MatrixApp'));

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
    design,
    setDesign,
    state,
    actions,
    sync: { offline, pending },
    writeError,
    clearWriteError,
  };

  if (design === 'retro') return <RetroApp {...props} />;
  return <Suspense fallback={null}>{design === 'classic' ? <ClassicApp {...props} /> : <MatrixApp {...props} />}</Suspense>;
}
