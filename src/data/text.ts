/** Ukrainian plural form: plural(5, 'відмітку', 'відмітки', 'відміток') → 'відміток' */
export function plural(n: number, one: string, few: string, many: string) {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return one;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
  return many;
}

export const upper = (s: string) => s.toLocaleUpperCase('uk');
