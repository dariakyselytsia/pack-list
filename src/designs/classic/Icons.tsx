import styles from './Icons.module.css';

export function Bow({ className }: { className?: string }) {
  return (
    <svg className={`${styles.bow} ${className ?? ''}`} width="110" height="64" viewBox="0 0 132 78" fill="none" aria-hidden="true">
      <path className={styles.petal} d="M66 34 C 50 8, 14 6, 10 24 C 6 42, 40 44, 66 34 Z" />
      <path className={styles.petal} d="M66 34 C 82 8, 118 6, 122 24 C 126 42, 92 44, 66 34 Z" />
      <path className={styles.tail} d="M60 36 C 52 50, 44 62, 30 74" />
      <path className={styles.tail} d="M72 36 C 80 50, 90 62, 104 72" />
      <ellipse className={styles.knot} cx="66" cy="34" rx="8" ry="7" />
    </svg>
  );
}

export function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M11 2.5 L13.5 5 L5.5 13 L2.5 13.5 L3 10.5 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ visible }: { visible: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ opacity: visible ? 1 : 0 }}>
      <path d="M2.5 6.2 L5 8.6 L9.5 3.6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 4.5 H13 M6.5 4.5 V3 H9.5 V4.5 M4.5 4.5 L5.2 13 H10.8 L11.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3 V13 M3 8 H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
