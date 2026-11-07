import { useState, type KeyboardEvent } from 'react';
import type { Item, ListId, Section } from '../../data/types';
import type { ListActions } from '../../hooks/useLists';
import { upper } from '../../data/text';
import { DebouncedInput } from '../../components/DebouncedInput';
import { CheckIcon, PlusIcon, TrashIcon } from './Icons';
import styles from './Deck.module.css';

const num = (i: number) => `${String(i + 1).padStart(2, '0')}.`;

interface Props {
  listId: ListId;
  sections: Section[];
  showHeaders: boolean;
  editing: boolean;
  actions: ListActions;
}

/** The dark "screen" with the items of the shown section(s). */
export function Deck({ listId, sections, showHeaders, editing, actions }: Props) {
  return (
    <div className={styles.screen}>
      <div className={styles.list}>
        {sections.map((s) => (
          <div key={s.id} className={styles.group} role="group" aria-label={s.title}>
            {showHeaders && (
              <div className={styles.groupHeader}>
                {editing ? (
                  <span className={styles.groupTitleEdit}>
                    <span aria-hidden="true">{s.sym}</span>
                    <DebouncedInput
                      className={styles.groupTitleInput}
                      value={s.title}
                      onSave={(t) => actions.setSectionTitle(listId, s.id, t)}
                      aria-label="Назва розділу"
                      enterKeyHint="done"
                    />
                  </span>
                ) : (
                  <span>
                    {s.sym} {upper(s.title)}
                  </span>
                )}
                <span className={styles.groupCount}>
                  {s.items.filter((x) => x.done).length}/{s.items.length}
                </span>
              </div>
            )}

            {s.items.map((it, i) =>
              editing ? (
                <EditRow
                  key={it.id}
                  item={it}
                  onSave={(t) => actions.setText(listId, s.id, it.id, t)}
                  onRemove={() => actions.remove(listId, s.id, it.id)}
                />
              ) : (
                <Row key={it.id} item={it} n={num(i)} onToggle={() => actions.toggle(listId, s.id, it.id)} />
              ),
            )}

            {!editing && s.items.length === 0 && <p className={styles.empty}>— ПОРОЖНЬО —</p>}
            {editing && <AddRow onAdd={(t) => actions.add(listId, s.id, t)} />}
          </div>
        ))}
      </div>

      <div aria-hidden="true" className={styles.scrollbar}>
        <span className={styles.arrow}>▲</span>
        <span className={styles.trough}>
          <span className={styles.thumb} />
        </span>
        <span className={`${styles.arrow} ${styles.arrowDown}`}>▼</span>
      </div>
    </div>
  );
}

function Row({ item, n, onToggle }: { item: Item; n: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={styles.row}
      data-sub={item.sub || undefined}
      data-done={item.done || undefined}
      aria-pressed={item.done}
      onClick={onToggle}
    >
      <span className={styles.box}>
        <CheckIcon visible={item.done} />
      </span>
      <span aria-hidden="true" className={styles.num}>
        {n}
      </span>
      <span className={styles.text}>{item.text}</span>
    </button>
  );
}

function EditRow({ item, onSave, onRemove }: { item: Item; onSave: (t: string) => void; onRemove: () => void }) {
  return (
    <div className={styles.editRow} data-sub={item.sub || undefined}>
      <DebouncedInput className={styles.input} value={item.text} onSave={onSave} aria-label="Назва пункту" enterKeyHint="done" />
      <button type="button" className={styles.roundBtn} aria-label={`Видалити «${item.text}»`} onClick={onRemove}>
        <TrashIcon />
      </button>
    </div>
  );
}

function AddRow({ onAdd }: { onAdd: (text: string) => boolean }) {
  const [draft, setDraft] = useState('');
  const submit = () => {
    if (onAdd(draft)) setDraft('');
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };
  return (
    <div className={styles.addRow}>
      <input
        className={`${styles.input} ${styles.draft}`}
        value={draft}
        placeholder="новий пункт…"
        aria-label="Новий пункт у розділі"
        enterKeyHint="enter"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <button type="button" className={styles.addBtn} aria-label="Додати пункт" disabled={!draft.trim()} onClick={submit}>
        <PlusIcon />
      </button>
    </div>
  );
}
