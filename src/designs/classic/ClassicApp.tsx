import { useEffect } from 'react';
import { LIST_IDS, type Mode } from '../../data/types';
import type { DesignProps } from '../types';
import { ModeSwitch } from './ModeSwitch';
import { ListPanel } from './ListPanel';
import { StatusCard, Toast } from './StatusCard';
import './theme.css';
import styles from './App.module.css';

const PAGE_BG: Record<Mode, string> = { her: '#f7e6ec', his: '#e7eef8', both: '#f6f1f6' };

export default function ClassicApp(props: DesignProps) {
  const { mode, setMode, switchDesign } = props;

  // Match the area outside the page (overscroll, browser chrome) to the mode.
  useEffect(() => {
    document.body.style.background = PAGE_BG[mode];
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', PAGE_BG[mode]);
  }, [mode]);

  return (
    <div className={`classic ${styles.page}`} data-mode={mode}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <div className={styles.kicker}>our cozy space / moving checklist :˚✧₊</div>
            <h1 className={styles.h1}>переїзд :˚✧₊˚ ✧</h1>
          </div>
          <div className={styles.controls}>
            <ModeSwitch mode={mode} onChange={setMode} />
            <button type="button" className={styles.designBtn} onClick={switchDesign}>
              дизайн ⇄ ретро
            </button>
          </div>
        </header>

        <Lists {...props} />

        <p className={styles.footer}>₊˚⊹ легкого переїзду ⊹˚₊</p>
      </div>
    </div>
  );
}

function Lists({ mode, state, actions, sync, writeError, clearWriteError }: DesignProps) {
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
      {(sync.offline || sync.pending) && (
        <div className={styles.syncRow} data-theme={mode}>
          <span className={styles.syncChip}>
            {sync.offline ? 'офлайн ⋆ зміни синхронізуються, щойно з’явиться інтернет' : 'зберігаємо…'}
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
