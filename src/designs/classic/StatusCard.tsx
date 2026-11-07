import type { ReactNode } from 'react';
import { Bow } from './Icons';
import styles from './StatusCard.module.css';

interface Props {
  title: string;
  children?: ReactNode;
  tone?: 'loading' | 'error';
  action?: { label: string; onClick: () => void };
}

export function StatusCard({ title, children, tone = 'loading', action }: Props) {
  return (
    <div className={styles.card} data-tone={tone} role={tone === 'error' ? 'alert' : 'status'} aria-live="polite">
      <Bow className={tone === 'loading' ? styles.bowFloat : undefined} />
      <h2 className={styles.title}>{title}</h2>
      {children && <div className={styles.text}>{children}</div>}
      {tone === 'loading' && (
        <div className={styles.track} aria-hidden="true">
          <div className={styles.shimmer} />
        </div>
      )}
      {action && (
        <button type="button" className={styles.btn} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

export function Toast({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className={styles.toast} role="alert">
      <span>{children}</span>
      <button type="button" className={styles.toastClose} aria-label="Закрити" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
