import styles from './Rain.module.css';

const GLYPHS = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789Z:=*+<>¦ЇЄҐ';
const COLS = 28;
const LINES = 60; // per half; the column is doubled for a seamless loop

/** Deterministic columns (same seed as the design), computed once. */
const columns = (() => {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: COLS }, () => {
    let s = '';
    for (let i = 0; i < LINES; i++) s += (rnd() < 0.12 ? ' ' : GLYPHS[Math.floor(rnd() * GLYPHS.length)]) + '\n';
    return { text: s + s, dur: `${10 + Math.round(rnd() * 14)}s`, delay: `-${Math.round(rnd() * 20)}s` };
  });
})();

/** Falling-glyph background (fixed to the viewport, decorative). */
export function Rain() {
  return (
    <>
      <div aria-hidden="true" className={styles.grid} />
      <div aria-hidden="true" className={styles.rain}>
        {columns.map((c, i) => (
          <div key={i} className={styles.col}>
            <div className={styles.stream} style={{ animationDuration: c.dur, animationDelay: c.delay }}>
              {c.text}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
