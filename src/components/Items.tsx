import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Item } from '../data/types';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
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

const SAVE_DELAY = 400;

export function ItemEditRow({
  item,
  onSave,
  onRemove,
}: {
  item: Item;
  onSave: (text: string) => void;
  onRemove: () => void;
}) {
  const [value, setValue] = useState(item.text);
  const focused = useRef(false);
  const save = useDebouncedCallback(onSave, SAVE_DELAY);

  // Pick up remote changes, but never overwrite what is being typed.
  useEffect(() => {
    if (!focused.current) setValue(item.text);
  }, [item.text]);

  return (
    <div className={styles.editRow} data-sub={item.sub || undefined}>
      <input
        className={styles.input}
        value={value}
        aria-label="Назва пункту"
        enterKeyHint="done"
        onFocus={() => {
          focused.current = true;
        }}
        onChange={(e) => {
          setValue(e.target.value);
          // Empty text is not saved; on blur the field reverts to the stored text.
          if (e.target.value.trim()) save.call(e.target.value);
        }}
        onBlur={() => {
          focused.current = false;
          save.flush();
          if (!value.trim()) setValue(item.text);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
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
