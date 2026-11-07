import { useEffect } from 'react';
import { LIST_IDS, type Mode } from '../../data/types';
import { DESIGN_LABELS, DESIGNS, type DesignProps } from '../types';
import { upper } from '../../data/text';
import { Window } from './Window';
import { ModeSwitch } from './ModeSwitch';
import { Player } from './Player';
import { StatusWindow } from './StatusWindow';
import './theme.css';
import styles from './RetroApp.module.css';

const PAGE_BG: Record<Mode, string> = { her: '#e9dde2', his: '#dbe3ec', both: '#e3dee4' };

export default function RetroApp(props: DesignProps) {
  const { mode, setMode, design, setDesign } = props;

  useEffect(() => {
    document.body.style.background = PAGE_BG[mode];
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', PAGE_BG[mode]);
  }, [mode]);

  return (
    <div className={`retro ${styles.page}`} data-mode={mode}>
      <div className={styles.container}>
        <Window title="ПЕРЕЇЗД :˚✧₊" sym="♡" heading="h1" maximise theme="both">
          <div className={styles.headerRow}>
            <div className={styles.brand}>
              <span aria-hidden="true" className={styles.led} />
              <span className={styles.brandText}>moving checklist ✧ v1.0</span>
              <div role="group" aria-label="Дизайн" className={styles.designs}>
                {DESIGNS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={styles.designBtn}
                    aria-pressed={design === d}
                    onClick={() => setDesign(d)}
                  >
                    <span className={styles.designPill}>{upper(DESIGN_LABELS[d])}</span>
                  </button>
                ))}
              </div>
            </div>
            <ModeSwitch mode={mode} onChange={setMode} />
          </div>
        </Window>

        <Content {...props} />

        <p className={styles.footer}>₊˚⊹ легкого переїзду ⊹˚₊</p>
      </div>
    </div>
  );
}

function Content({ mode, state, actions, sync, writeError, clearWriteError }: DesignProps) {
  const theme = mode;
  if (state.status === 'error') {
    return (
      <StatusWindow
        theme={theme}
        title="ПОМИЛКА"
        screen="ERROR ✦ ЩОСЬ ПІШЛО НЕ ТАК"
        tone="error"
        action={{ label: 'СПРОБУВАТИ ЩЕ', onClick: () => location.reload() }}
      >
        {state.message}
      </StatusWindow>
    );
  }

  if (state.status === 'loading') {
    return (
      <StatusWindow
        theme={theme}
        title="ЗАВАНТАЖЕННЯ"
        screen={state.waitingForNetwork ? 'NO SIGNAL ✦ ЧЕКАЄМО НА ІНТЕРНЕТ' : 'LOADING ✦ РОЗПАКОВУЄМО СПИСОК…'}
      >
        {state.waitingForNetwork && 'Перший запуск на цьому пристрої потребує з’єднання. Далі список працюватиме й офлайн.'}
      </StatusWindow>
    );
  }

  const visible = mode === 'both' ? LIST_IDS : [mode];
  return (
    <>
      {(sync.offline || sync.pending) && (
        <div className={styles.syncRow} data-theme={theme}>
          <span className={styles.syncChip}>
            <span aria-hidden="true" className={styles.syncLed} data-kind={sync.offline ? 'offline' : 'pending'} />
            {sync.offline ? 'ОФЛАЙН ✦ зміни синхронізуються, щойно з’явиться інтернет' : 'ЗБЕРІГАЄМО…'}
          </span>
        </div>
      )}
      <main className={styles.panels}>
        {visible.map((id) => (
          <Player key={id} listId={id} list={state.lists[id]} actions={actions} />
        ))}
      </main>
      {writeError && (
        <div className={styles.toast} role="alert" data-theme={theme}>
          <span>не вдалося зберегти: {writeError}</span>
          <button type="button" className={styles.toastClose} aria-label="Закрити" onClick={clearWriteError}>
            ×
          </button>
        </div>
      )}
    </>
  );
}
