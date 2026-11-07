import { useEffect, useRef, useState } from 'react';
import type { ListId, PackList } from '../../data/types';
import type { ListActions } from '../../hooks/useLists';
import { Bow, PencilIcon } from './Icons';
import { anchorId, countDone, pct, SectionCard } from './SectionCard';
import styles from './ListPanel.module.css';

function plural(n: number, one: string, few: string, many: string) {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return one;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
  return many;
}

interface Props {
  listId: ListId;
  list: PackList;
  showNav: boolean;
  actions: ListActions;
}

export function ListPanel({ listId, list, showNav, actions }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const totals = list.sections.reduce(
    (acc, s) => ({ done: acc.done + countDone(s), all: acc.all + s.items.length }),
    { done: 0, all: 0 },
  );
  const percent = pct(totals.done, totals.all);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  // Nothing to reset any more (e.g. reset from the other device) → close the prompt.
  useEffect(() => {
    if (totals.done === 0) setConfirming(false);
  }, [totals.done]);

  return (
    <div className={styles.panel} data-theme={list.theme ?? listId}>
      <div className={styles.header}>
        <div className={styles.nameBlock}>
          <Bow />
          <h2 className={styles.name}>{list.name}</h2>
        </div>

        <div className={styles.stats}>
          <div className={styles.statsRow}>
            <span className={styles.statsLabel}>
              зібрано ⋆˚ {totals.done} з {totals.all}
            </span>
            <span className={styles.statsPct}>{percent}%</span>
          </div>
          <div className={styles.track} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="Зібрано всього">
            <div className={styles.fill} style={{ width: `${percent}%` }} />
          </div>

          {confirming ? (
            <div className={styles.buttons} role="group" aria-label="Підтвердження">
              <span className={styles.confirmText}>
                зняти {totals.done} {plural(totals.done, 'відмітку', 'відмітки', 'відміток')}?
              </span>
              <button
                ref={confirmRef}
                type="button"
                className={`${styles.btn} ${styles.btnSolid}`}
                onClick={() => {
                  actions.reset(listId);
                  setConfirming(false);
                }}
              >
                так, скинути
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setConfirming(false)}>
                ні
              </button>
            </div>
          ) : (
            <div className={styles.buttons}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnEdit}`}
                aria-pressed={editing}
                onClick={() => setEditing((v) => !v)}
              >
                <PencilIcon />
                <span>{editing ? 'готово' : 'редагувати'}</span>
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost}`}
                disabled={totals.done === 0}
                onClick={() => setConfirming(true)}
              >
                скинути
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.body}>
        {showNav && (
          <nav aria-label="Розділи" className={styles.nav}>
            <div className={styles.navLabel}>розділи ₊ ✧</div>
            <div className={styles.navLinks}>
              {list.sections.map((s) => (
                <a key={s.id} href={`#${anchorId(listId, s.id)}`} className={styles.navLink}>
                  <span>
                    {s.sym} {s.title}
                  </span>
                  <span className={styles.navCount}>
                    {countDone(s)}/{s.items.length}
                  </span>
                </a>
              ))}
            </div>
          </nav>
        )}

        <div className={styles.sections}>
          {list.sections.map((s) => (
            <SectionCard key={s.id} listId={listId} section={s} editing={editing} actions={actions} />
          ))}
        </div>
      </div>
    </div>
  );
}
