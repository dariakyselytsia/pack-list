import type { Mode } from '../../data/types';
import styles from './ModeSwitch.module.css';

const OPTIONS: { id: Mode; label: string }[] = [
  { id: 'her', label: '♡ МІЙ СПИСОК' },
  { id: 'his', label: '✧ ЙОГО СПИСОК' },
  { id: 'both', label: '♡✧ ОБИДВА' },
];

export function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div role="group" aria-label="Який список показати" className={styles.group}>
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          className={styles.btn}
          data-mode={o.id}
          aria-pressed={mode === o.id}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
