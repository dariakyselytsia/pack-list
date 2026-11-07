/** ASCII art for the matrix design (ported from makeBanner / makeSphere in the design). */

const FONT: Record<string, string[]> = {
  П: ['#####', '#   #', '#   #', '#   #', '#   #'],
  Е: ['#####', '#    ', '#### ', '#    ', '#####'],
  Р: ['#### ', '#   #', '#### ', '#    ', '#    '],
  Ї: ['# #', ' # ', ' # ', ' # ', ' # '],
  З: ['#### ', '    #', ' ### ', '    #', '#### '],
  Д: [' ### ', ' # # ', ' # # ', '#####', '#   #'],
};

/** "ПЕРЕЇЗД" in 5-row block letters (47 columns wide). */
export const BANNER = [0, 1, 2, 3, 4]
  .map((r) => ['П', 'Е', 'Р', 'Е', 'Ї', 'З', 'Д'].map((ch) => FONT[ch][r]).join('  '))
  .join('\n');
export const BANNER_COLS = 47;

const SHADES = '.:-=+*#%@';

// 26×15 chars ≈ round at 0.6em-wide glyphs (26 × 0.6 ≈ 15.6em wide, 15em tall)
const SPHERE_COLS = 26;
const SPHERE_ROWS = 15;
const GRID = 30; // degrees between meridians / parallels
const LINE = 4.5; // half-width of a grid line, degrees
const TILT = 0.35; // axis leaning towards the viewer
const ROLL = (23.5 * Math.PI) / 180; // axis leaning sideways, like a desk globe
const cr = Math.cos(ROLL);
const sr = Math.sin(ROLL);

/** Shaded wireframe globe on a tilted axis, rotated by `a` radians. */
export function sphere(a: number): string {
  const cols = SPHERE_COLS;
  const rows = SPHERE_ROWS;
  const out: string[] = [];
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const ct = Math.cos(TILT);
  const st = Math.sin(TILT);
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let c = 0; c < cols; c++) {
      const nx = ((c + 0.5) / cols) * 2 - 1;
      const ny = ((r + 0.5) / rows) * 2 - 1;
      const d = nx * nx + ny * ny;
      if (d > 1) {
        line += ' ';
        continue;
      }
      const nz = Math.sqrt(1 - d);
      // roll the globe around the view axis; lighting below stays screen-fixed
      const rx = nx * cr + ny * sr;
      const ry = -nx * sr + ny * cr;
      const y1 = ry * ct - nz * st;
      const z1 = ry * st + nz * ct;
      const x2 = rx * ca + z1 * sa;
      const z2 = -rx * sa + z1 * ca;
      const lon = (Math.atan2(x2, z2) * 180) / Math.PI;
      const lat = (Math.asin(Math.max(-1, Math.min(1, y1))) * 180) / Math.PI;
      const h = GRID / 2;
      const dl = Math.abs((((lon % GRID) + GRID + h) % GRID) - h);
      const dp = Math.abs((((lat % GRID) + GRID + h) % GRID) - h);
      const light = Math.max(0, nz * 0.75 + -nx * 0.35 + -ny * 0.25);
      if (dl < LINE || dp < LINE) line += SHADES[Math.min(SHADES.length - 1, 3 + Math.floor(light * 6))];
      else if (d > 0.82) line += '.';
      else line += ' ';
    }
    out.push(line);
  }
  return out.join('\n');
}

const BAR_W = 20;

/** "<3 <3 .. .." — ten hearts, filled by progress ratio. */
export const hearts = (ratio: number) =>
  Array.from({ length: 10 }, (_, i) => (i < Math.round(ratio * 10) ? '<3' : '..')).join(' ');

/** Scale with a caret under the current progress. */
export const ruler = (ratio: number) =>
  `0    25   50   75   100\n|----|----|----|----|\n${' '.repeat(Math.min(BAR_W, Math.round(ratio * BAR_W)))}^ ти тут`;
