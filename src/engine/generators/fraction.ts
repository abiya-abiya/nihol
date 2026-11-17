// Exact fraction arithmetic for generators and content checks. Integers only, no floats.

export interface Fr {
  n: number;
  d: number;
} // always normalised: d > 0

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function lcm(a: number, b: number): number {
  return (Math.abs(a) / gcd(a, b)) * Math.abs(b);
}

function norm(n: number, d: number): Fr {
  if (d === 0) throw new Error("fraction with zero denominator");
  return d < 0 ? { n: -n, d: -d } : { n, d };
}

export function simplify(f: Fr): Fr {
  const g = gcd(f.n, f.d) || 1;
  return norm(f.n / g, f.d / g);
}

export function add(a: Fr, b: Fr): Fr {
  return simplify(norm(a.n * b.d + b.n * a.d, a.d * b.d));
}
export function sub(a: Fr, b: Fr): Fr {
  return simplify(norm(a.n * b.d - b.n * a.d, a.d * b.d));
}
export function mul(a: Fr, b: Fr): Fr {
  return simplify(norm(a.n * b.n, a.d * b.d));
}
export function div(a: Fr, b: Fr): Fr {
  return simplify(norm(a.n * b.d, a.d * b.n));
}

/** value equality: [[2/4]] equals [[1/2]] */
export function eq(a: Fr, b: Fr): boolean {
  return a.n * b.d === b.n * a.d;
}

/** "[[3/4]]", "[[2 1/3]]" (mixed), "5" for whole numbers. Does not simplify. Non-negative values only. */
export function toMarkup(f: Fr, opts?: { mixed?: boolean }): string {
  const { n, d } = norm(f.n, f.d);
  if (n < 0) throw new Error("toMarkup: negative fraction");
  if (d === 1) return String(n);
  if (opts?.mixed && n >= d) {
    const w = Math.floor(n / d);
    const r = n % d;
    return r === 0 ? String(w) : `[[${w} ${r}/${d}]]`;
  }
  return `[[${n}/${d}]]`;
}

/** Parses a choice that is a single number or fraction markup; null for anything else. */
export function parseValue(text: string): Fr | null {
  const t = text.trim();
  if (/^\d+$/.test(t)) return { n: Number(t), d: 1 };
  const m = t.match(/^\[\[(?:(\d+) )?(\d+)\/(\d+)\]\]$/);
  if (!m || Number(m[3]) === 0) return null;
  const w = Number(m[1] ?? 0);
  const d = Number(m[3]);
  return { n: w * d + Number(m[2]), d };
}
