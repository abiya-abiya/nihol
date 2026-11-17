/**
 * Normalise Uzbek Latin apostrophes for display.
 * o' g' O' G' (with ' ‘ ’ ` or ʼ) -> oʻ gʻ Oʻ Gʻ (U+02BB, the official letters)
 * any other apostrophe between two letters -> ʼ (U+02BC, tutuq belgisi)
 * Content authors type plain ' ; this runs at render time.
 */
const OKINA = "\u02BB";
const TUTUQ = "\u02BC";

export function normalizeUz(s: string): string {
  return s
    .replace(/([oOgG])['\u2018\u2019`\u02BC\u02BB]/g, `$1${OKINA}`)
    .replace(/(\p{L})['\u2018\u2019`](?=\p{L})/gu, `$1${TUTUQ}`);
}
