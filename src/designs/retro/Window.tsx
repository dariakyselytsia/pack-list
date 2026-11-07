import type { ReactNode } from 'react';
import styles from './Window.module.css';

interface Props {
  title: string;
  /** symbol in the left "system menu" box */
  sym: string;
  heading: 'h1' | 'h2';
  /** minimise / maximise / close boxes — header window has all three */
  maximise?: boolean;
  theme?: string;
  className?: string;
  children: ReactNode;
}

/** Retro window: gradient frame + striped title bar with fake controls. */
export function Window({ title, sym, heading: H, maximise, theme, className, children }: Props) {
  return (
    <div className={`${styles.window} ${className ?? ''}`} data-theme={theme}>
      <div className={styles.bar}>
        <span aria-hidden="true" className={styles.box}>
          {sym}
        </span>
        <span aria-hidden="true" className={styles.stripes} />
        <H className={styles.title}>{title}</H>
        <span aria-hidden="true" className={styles.stripes} />
        <span aria-hidden="true" className={styles.controls}>
          <span className={`${styles.box} ${styles.min}`}>
            <span />
          </span>
          {maximise && (
            <span className={`${styles.box} ${styles.max}`}>
              <span />
            </span>
          )}
          <span className={`${styles.box} ${styles.close}`}>×</span>
        </span>
      </div>
      {children}
    </div>
  );
}
