import { useState, type KeyboardEvent } from 'react';
import type { Item } from '../../data/types';
import { DebouncedInput } from '../../components/DebouncedInput';
import { CheckIcon, PlusIcon, TrashIcon } from './Icons';
import styles from './Items.module.css';

export function ItemRow({ item, onToggle }: { item: Item; onToggle: () => void }) {
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
      <span className={styles.text}>{item.text}</span>
    </button>
  );
}

export function ItemEditRow({
  item,
  onSave,
  onRemove,
}: {
  item: Item;
  onSave: (text: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className={styles.editRow} data-sub={item.sub || undefined}>
      <DebouncedInput
        className={styles.input}
        value={item.text}
        onSave={onSave}
        aria-label="Назва пункту"
        enterKeyHint="done"
      />
      <button type="button" className={styles.iconBtn} aria-label={`Видалити «${item.text}»`} onClick={onRemove}>
        <TrashIcon />
      </button>
    </div>
  );
}

export function AddItemRow({ onAdd }: { onAdd: (text: string) => boolean }) {
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
      <button
        type="button"
        className={`${styles.iconBtn} ${styles.addBtn}`}
        aria-label="Додати пункт"
        disabled={!draft.trim()}
        onClick={submit}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
