import { useEffect } from 'react';
import { missingConfig } from './firebase';
import { LIST_IDS, type Mode } from './data/types';
import { useLists } from './hooks/useLists';
import { useStoredMode } from './hooks/useStoredMode';
import { useDelayedFlag } from './hooks/useDelayedFlag';
import { ModeSwitch } from './components/ModeSwitch';
import { ListPanel } from './components/ListPanel';
import { StatusCard, Toast } from './components/StatusCard';
import styles from './App.module.css';

const PAGE_BG: Record<Mode, string> = { her: '#f7e6ec', his: '#e7eef8', both: '#f6f1f6' };

export default function App() {
  const [mode, setMode] = useStoredMode();

  // Match the area outside the page (overscroll, browser chrome) to the mode.
  useEffect(() => {
    document.body.style.background = PAGE_BG[mode];
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', PAGE_BG[mode]);
  }, [mode]);

  return (
    <div className={styles.page} data-mode={mode}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <div className={styles.kicker}>our cozy space / moving checklist :˚✧₊</div>
            <h1 className={styles.h1}>переїзд :˚✧₊˚ ✧</h1>
          </div>
          <ModeSwitch mode={mode} onChange={setMode} />
        </header>

        {missingConfig.length ? (
          <div data-theme={mode}>
            <StatusCard title="немає конфігу Firebase" tone="error">
              <p>
                Заповни <code>.env</code> за зразком <code>.env.example</code>. Бракує: <code>{missingConfig.join(', ')}</code>
              </p>
            </StatusCard>
          </div>
        ) : (
          <Lists mode={mode} />
        )}

        <p className={styles.footer}>₊˚⊹ легкого переїзду ⊹˚₊</p>
      </div>
    </div>
  );
}

function Lists({ mode }: { mode: Mode }) {
  const { state, actions, writeError, clearWriteError } = useLists();
  const offline = useDelayedFlag(state.status === 'ready' && state.offline);
  const pending = useDelayedFlag(state.status === 'ready' && state.pending);

  if (state.status === 'error') {
    return (
      <div data-theme={mode}>
        <StatusCard
          title="щось пішло не так ˚‧º·"
          tone="error"
          action={{ label: 'спробувати ще', onClick: () => location.reload() }}
        >
          <p>{state.message}</p>
        </StatusCard>
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div data-theme={mode}>
        <StatusCard title={state.waitingForNetwork ? 'чекаємо на інтернет ⋆' : 'розпаковуємо список…'}>
          {state.waitingForNetwork && (
            <p>Перший запуск на цьому пристрої потребує з’єднання. Далі список працюватиме й офлайн.</p>
          )}
        </StatusCard>
      </div>
    );
  }

  const visible = mode === 'both' ? LIST_IDS : [mode];
  return (
    <>
      {(offline || pending) && (
        <div className={styles.syncRow} data-theme={mode}>
          <span className={styles.syncChip}>
            {offline ?'офлайн ⋆ зміни синхронізуються, щойно з’явиться інтернет' : 'зберігаємо…'}
          </span>
        </div>
      )}
      <main className={styles.panels}>
        {visible.map((id) => (
          <ListPanel key={id} listId={id} list={state.lists[id]} showNav={mode !== 'both'} actions={actions} />
        ))}
      </main>
      {writeError && <Toast onClose={clearWriteError}>не вдалося зберегти: {writeError}</Toast>}
    </>
  );
}
