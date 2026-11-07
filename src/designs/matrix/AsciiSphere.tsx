import { useEffect, useState } from 'react';
import { sphere } from './ascii';

const STEP = 0.12;
const TICK_MS = 140;

/** Rotating ASCII globe. Own state, so only this <pre> re-renders each tick.
 *  Stops for reduced motion and while the tab is hidden. */
export function AsciiSphere({ className }: { className?: string }) {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    let reduce = false;
    try {
      reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      /* ignore */
    }
    if (reduce) return;
    const id = setInterval(() => {
      if (!document.hidden) setAngle((a) => a + STEP);
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <pre aria-hidden="true" className={className}>
      {sphere(angle)}
    </pre>
  );
}
