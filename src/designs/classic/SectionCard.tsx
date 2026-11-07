import type { ListId, Section } from '../../data/types';
import type { ListActions } from '../../hooks/useLists';
import { DebouncedInput } from '../../components/DebouncedInput';
import { AddItemRow, ItemEditRow, ItemRow } from './Items';
import styles from './SectionCard.module.css';

export const anchorId = (listId: ListId, secId: string) => `${listId}-${secId}`;

export function countDone(s: Section) {
  return s.items.reduce((n, x) => n + (x.done ? 1 : 0), 0);
}

export const pct = (done: number, total: number) => (total ? Math.round((done / total) * 100) : 0);

interface Props {
  listId: ListId;
  section: Section;
  editing: boolean;
  actions: ListActions;
}

export function SectionCard({ listId, section: s, editing, actions }: Props) {
  const done = countDone(s);
  const total = s.items.length;
  return (
    <section id={anchorId(listId, s.id)} className={styles.card} aria-labelledby={`${anchorId(listId, s.id)}-h`}>
      <div className={styles.head}>
        <div className={styles.titleRow}>
          <h3 id={`${anchorId(listId, s.id)}-h`} className={styles.title}>
            {editing ? (
              <span className={styles.titleEdit}>
                <span aria-hidden="true">{s.sym}</span>
                <DebouncedInput
                  className={styles.titleInput}
                  value={s.title}
                  onSave={(t) => actions.setSectionTitle(listId, s.id, t)}
                  aria-label="Назва розділу"
                  enterKeyHint="done"
                />
              </span>
            ) : (
              <>
                {s.sym} {s.title}
              </>
            )}
          </h3>
          <span className={styles.count}>
            {done}/{total}
          </span>
        </div>
        <div className={styles.track} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct(done, total)} aria-label={`${s.title}: зібрано`}>
          <div className={styles.fill} style={{ width: `${pct(done, total)}%` }} />
        </div>
        {s.note && <p className={styles.note}>{s.note}</p>}
      </div>

      <div className={styles.items}>
        {s.items.map((it) =>
          editing ? (
            <ItemEditRow
              key={it.id}
              item={it}
              onSave={(text) => actions.setText(listId, s.id, it.id, text)}
              onRemove={() => actions.remove(listId, s.id, it.id)}
            />
          ) : (
            <ItemRow key={it.id} item={it} onToggle={() => actions.toggle(listId, s.id, it.id)} />
          ),
        )}
        {!editing && total === 0 && <p className={styles.empty}>тут поки порожньо ⋆</p>}
        {editing && <AddItemRow onAdd={(text) => actions.add(listId, s.id, text)} />}
      </div>
    </section>
  );
}
