import { useEffect } from 'react';
import { LIST_IDS, type Mode } from '../../data/types';
import { upper } from '../../data/text';
import { DESIGN_LABELS, DESIGNS, type DesignProps } from '../types';
import { Rain } from './Rain';
import { Terminal } from './Terminal';
import './theme.css';
import styles from './MatrixApp.module.css';

const MODES: { id: Mode; label: string }[] = [
  { id: 'her', label: 'МІЙ СПИСОК' },
  { id: 'his', label: 'ЙОГО СПИСОК' },
  { id: 'both', label: 'ОБИДВА' },
];

export default function MatrixApp(props: DesignProps) {
  const { mode, setMode, design, setDesign } = props;

  useEffect(() => {
    document.body.style.background = '#030703';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#030703');
  }, []);

  return (
    <div className={`matrix ${styles.page}`} data-mode={mode}>
      <Rain />

      <div className={styles.container}>
        <div className={styles.bar}>
          <span>переїзд.exe</span>
          <span aria-hidden="true" className={styles.barGlyph}>
            ↺↻
          </span>
          <span>v2.0 // 2026</span>
        </div>

        <div className={styles.frame}>
          <span aria-hidden="true" className={`${styles.corner} ${styles.tl}`} />
          <span aria-hidden="true" className={`${styles.corner} ${styles.tr}`} />
          <span aria-hidden="true" className={`${styles.corner} ${styles.bl}`} />
          <span aria-hidden="true" className={`${styles.corner} ${styles.br}`} />

          <header className={styles.header}>
            <div className={styles.titleCell}>
              <div className={styles.project}>ПРОЄКТ №001 // ПЕРЕЇЗД</div>
              <h1 className={styles.h1}>ПЕРЕЇЗД</h1>
            </div>
            <div className={styles.pickCell}>
              <div className={styles.label}>/// ОБЕРИ КОРИСТУВАЧА</div>
              <div role="group" aria-label="Який список показати" className={styles.modes}>
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={styles.mode}
                    data-mode={m.id}
                    aria-pressed={mode === m.id}
                    onClick={() => setMode(m.id)}
                  >
                    [ {m.label} ]
                  </button>
                ))}
              </div>
              <div className={styles.label}>/// ДИЗАЙН</div>
              <div role="group" aria-label="Дизайн" className={styles.designs}>
                {DESIGNS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={styles.design}
                    aria-pressed={design === d}
                    onClick={() => setDesign(d)}
                  >
                    {design === d ? '■' : '□'} {upper(DESIGN_LABELS[d])}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <Content {...props} />

          <div aria-hidden="true" className={styles.divider}>
            <span />
            <span className={styles.dividerText}>ВАЛІЗИ</span>
            <span />
          </div>
        </div>

        <div className={styles.bar}>
          <span>@ми_удвох</span>
          <span aria-hidden="true" className={styles.barGlyph}>
            ↺↻
          </span>
          <span>// легкого переїзду _</span>
        </div>
      </div>
    </div>
  );
}

function Content({ mode, state, actions, sync, writeError, clearWriteError }: DesignProps) {
  if (state.status === 'error') {
    return (
      <div className={styles.status} data-theme={mode} role="alert">
        <p className={styles.statusLine}>&gt; ПОМИЛКА_</p>
        <p className={styles.statusText}>/* {state.message} */</p>
        <button type="button" className={styles.statusBtn} onClick={() => location.reload()}>
          [ СПРОБУВАТИ ЩЕ ]
        </button>
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div className={styles.status} data-theme={mode} role="status" aria-live="polite">
        <p className={styles.statusLine}>
          &gt; {state.waitingForNetwork ? 'ЧЕКАЄМО НА МЕРЕЖУ' : 'ЗАВАНТАЖЕННЯ СПИСКУ…'}
          <span aria-hidden="true" className={styles.caret}>
            _
          </span>
        </p>
        {state.waitingForNetwork && (
          <p className={styles.statusText}>
            /* Перший запуск на цьому пристрої потребує з’єднання. Далі список працюватиме й офлайн. */
          </p>
        )}
      </div>
    );
  }

  const visible = mode === 'both' ? LIST_IDS : [mode];
  return (
    <>
      {(sync.offline || sync.pending) && (
        <div className={styles.sync} data-theme={mode}>
          {sync.offline ? '/// ОФЛАЙН — зміни синхронізуються, щойно з’явиться мережа' : '/// ЗБЕРЕЖЕННЯ…'}
          <span aria-hidden="true" className={styles.caret}>
            _
          </span>
        </div>
      )}
      <main className={styles.panels}>
        {visible.map((id) => (
          <Terminal key={id} listId={id} list={state.lists[id]} actions={actions} />
        ))}
      </main>
      {writeError && (
        <div className={styles.toast} role="alert" data-theme={mode}>
          <span>&gt; НЕ ЗБЕРЕЖЕНО: {writeError}</span>
          <button type="button" className={styles.toastClose} aria-label="Закрити" onClick={clearWriteError}>
            [×]
          </button>
        </div>
      )}
    </>
  );
}
