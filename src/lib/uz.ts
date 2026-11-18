/**
 * Normalise Uzbek text for display in the NEW alphabet (law of 21 Oct 2026).
 * Only the old oʻ/gʻ forms are converted here (o' g' o‘ o’ oʻ -> ö ğ, capitals too);
 * sh/ch are NOT converted at runtime (English content must stay intact) — write ş/ç in the source.
 * Any other apostrophe between two letters becomes the tutuq belgisi ʼ.
 */
const TUTUQ = "ʼ";
const NEW: Record<string, string> = { o: "ö", O: "Ö", g: "ğ", G: "Ğ" };

export function normalizeUz(s: string): string {
  return s
    .replace(/([oOgG])['‘’`ʻ]/g, (_, l: string) => NEW[l] ?? l)
    .replace(/(\p{L})['‘’`](?=\p{L})/gu, `$1${TUTUQ}`);
}
