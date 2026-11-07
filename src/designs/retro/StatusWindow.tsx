import type { ReactNode } from 'react';
import type { Mode } from '../../data/types';
import { Window } from './Window';
import styles from './StatusWindow.module.css';

interface Props {
  theme: Mode;
  title: string;
  /** scrolling text on the LCD */
  screen: string;
  tone?: 'loading' | 'error';
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
}

/** Loading / error state as a small player window with an LCD. */
export function StatusWindow({ theme, title, screen, tone = 'loading', action, children }: Props) {
  return (
    <Window title={title} sym={tone === 'error' ? '!' : '♡'} heading="h2" theme={theme} className={styles.window}>
      <div className={styles.lcd} role={tone === 'error' ? 'alert' : 'status'} aria-live="polite">
        <div className={styles.lcdTop}>
          <span aria-hidden="true" className={styles.play}>
            {tone === 'error' ? '■' : '▶'}
          </span>
          <span className={styles.big} aria-hidden="true">
            {tone === 'error' ? 'ERR' : '--%'}
          </span>
          <div aria-hidden="true" className={styles.bars} data-tone={tone}>
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        </div>
        <div className={styles.ticker}>
          <span className={styles.mq}>
            <span>{screen}</span>
            <span aria-hidden="true">{screen}</span>
          </span>
        </div>
      </div>
      {children && <p className={styles.text}>{children}</p>}
      {action && (
        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={action.onClick}>
            {action.label}
          </button>
        </div>
      )}
    </Window>
  );
}
