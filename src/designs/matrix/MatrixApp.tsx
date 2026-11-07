import { useEffect } from 'react';
import { LIST_IDS, type Mode } from '../../data/types';
import { upper } from '../../data/text';
import { DESIGN_LABELS, DESIGNS, type DesignProps } from '../types';
import { Rain } from './Rain';
import { Terminal } from './Terminal';
import { BANNER } from './ascii';
import './theme.css';
import styles from './MatrixApp.module.css';

const MODES: { id: Mode; label: string }[] = [
  { id: 'her', label: 'МІЙ СПИСОК' },
  { id: 'his', label: 'ЙОГО СПИСОК' },
  { id: 'both', label: 'ОБИДВА' },
];

export default function MatrixApp(props: DesignProps) {
  const { mode, setMode, design, setDesign, state } = props;

  useEffect(() => {
    document.body.style.background = '#030703';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#030703');
  }, []);

  // Overall progress of the lists on screen, for the bottom "suitcases" bar.
  let overall: number | null = null;
  if (state.status === 'ready') {
    let d = 0;
    let a = 0;
    (mode === 'both' ? LIST_IDS : [mode]).forEach((id) =>
      state.lists[id].sections.forEach((s) => {
        a += s.items.length;
        d += s.items.filter((x) => x.done).length;
      }),
    );
    overall = a ? Math.round((d / a) * 100) : 0;
  }

  return (
    <div className={`matrix ${styles.page}`} data-mode={mode}>
      <Rain />
      {/* CRT: scanlines + vignette over everything */}
      <div aria-hidden="true" className={styles.scanlines} />
      <div aria-hidden="true" className={styles.vignette} />

      <div className={styles.container}>
        <div className={styles.prompt}>
          <span>C:\Users\duo&gt; Готові до переїзду?</span>
          <span>
            Y/N .. Y
            <span className={styles.caret} aria-hidden="true">
              _
            </span>
          </span>
        </div>
        <div aria-hidden="true" className={styles.sub}>
          <span>pereizd.exe // v2.0</span>
          <span className={styles.subMid}>&lt;--[ :: ]--&gt;</span>
          <span>2026</span>
        </div>

        <div className={styles.frame}>
          <span aria-hidden="true" className={`${styles.plus} ${styles.tl}`}>
            +
          </span>
          <span aria-hidden="true" className={`${styles.plus} ${styles.tr}`}>
            +
          </span>
          <span aria-hidden="true" className={`${styles.plus} ${styles.bl}`}>
            +
          </span>
          <span aria-hidden="true" className={`${styles.plus} ${styles.br}`}>
            +
          </span>
          <span aria-hidden="true" className={`${styles.tag} ${styles.tagL}`}>
            [ sys::checklist ]
          </span>
          <span aria-hidden="true" className={`${styles.tag} ${styles.tagR}`}>
            -=[ 0x7E9 ]=-
          </span>

          <header className={styles.header}>
            <div className={styles.titleCell}>
              <div className={styles.project}>&gt;&gt; ПРОЄКТ #001 // ПЕРЕЇЗД</div>
              <h1 className={styles.h1} aria-label="ПЕРЕЇЗД">
                <pre aria-hidden="true" className={styles.banner}>
                  {BANNER}
                </pre>
              </h1>
              <div aria-hidden="true" className={styles.wave}>
                {'~='.repeat(40)}
              </div>
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
                    {design === d ? '[x]' : '[ ]'} {upper(DESIGN_LABELS[d])}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <Content {...props} />

          <div className={styles.loadBar} aria-label={overall === null ? undefined : `Зібрано разом: ${overall}%`}>
            <span aria-hidden="true" className={styles.loadText}>
              Завантаження валіз..
            </span>
            <span aria-hidden="true" className={styles.loadTrack}>
              <span className={styles.loadFill} style={{ width: `${overall ?? 0}%` }} />
            </span>
            <span aria-hidden="true" className={styles.loadPct}>
              {overall === null ? '..' : overall === 100 ? 'ГОТОВО' : `${overall}%`}
            </span>
          </div>
        </div>

        <div className={styles.foot}>
          <span>@ми_удвох &lt;3</span>
          <span aria-hidden="true" className={styles.footMid}>
            &lt;--[ :: ]--&gt;
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
        <p className={styles.statusLine}>C:\&gt; ПОМИЛКА_</p>
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
          C:\&gt; {state.waitingForNetwork ? 'ЧЕКАЄМО НА МЕРЕЖУ' : 'ЗАВАНТАЖЕННЯ СПИСКУ..'}
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
          {sync.offline ? '/// ОФЛАЙН — зміни синхронізуються, щойно з’явиться мережа' : '/// ЗБЕРЕЖЕННЯ..'}
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
