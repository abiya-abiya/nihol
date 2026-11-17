# Design — "Katak daftar + Ildiz"

Owner: A (A2 turns this into tokens and may refine it; keep this file in
sync with `globals.css`).

## World

The Uzbek school squared notebook (*katak daftar*): warm paper, a faint
blue grid, ink-blue writing, the teacher's red pen for mistakes, a green
tick for mastery, a yellow highlighter for the key word. Over it, the
**root** metaphor: knowledge grows from the roots at the bottom up to the
topic at the top; gaps glow at the roots. Confident, crafted, a little
playful — a beautiful exercise book, not a corporate dashboard.

## Tokens (starting values)

| Token | Value | Use |
|---|---|---|
| `--paper` | `#FBFAF5` | page background |
| `--grid` | `#DCE6F2` | 24 px notebook grid lines (`.bg-katak`) |
| `--card` | `#FFFFFF` | sheets/cards on the paper |
| `--ink` | `#1D2B64` | text, primary buttons, outlines |
| `--ink-soft` | `#4A5785` | secondary text, normal map edges |
| `--red-pen` | `#E5484D` | mistakes, gap level, trace line |
| `--mastered` | `#2F9E5B` | mastered level, success |
| `--shaky` | `#F0A30A` | shaky level |
| `--unknown` | `#A3ADC2` | not tested |
| `--highlight` | `#FFE45C` | highlighter behind key words (60% opacity) |

Light theme only (dark mode is a non-goal). Contrast AA for all text.

## Type

- Display: **Unbounded** (600–800) — titles, big numbers, landing headline.
- Body/UI: **Onest** (400–700).
- Hand: **Caveat** (600) — only for teacher-pen annotations ("ildiz shu yerda!", ticks, short margin notes).
- Verify `oʻ gʻ ʼ` render in each font (A2). If a font lacks them, swap
  for one that has them (e.g. Manrope / Golos Text) and update this file.
- Fractions: stacked numerals via `<Frac>`, tabular figures.

## Shape and depth

Cards are paper sheets: white, 16 px radius, 1 px `--grid` border, soft
shadow. Buttons: 14 px radius, ink fill (primary) or 2 px ink outline.
Choice buttons ≥ 56 px tall, letter in a circle on the left.

## Motion (motion/react)

- UI feedback 150–250 ms, page transitions 300–400 ms, springs
  (`stiffness ~300, damping ~30`).
- Wrong answer: red-pen strike drawn across the choice (SVG path
  length animation) + short horizontal shake.
- Correct: green tick stamp + small confetti burst.
- Hero sequences may run longer: knowledge map reveal (~6–8 s total),
  path stem growth, skill-complete celebration.
- Numbers animate with `@number-flow/react`.
- `prefers-reduced-motion`: jump to end states, no confetti, no shake.

## Knowledge map

Nodes are pills on paper (short title + mastery ring). Normal edges: thin
ink-soft lines. Trace edges: 3 px red pen, drawn top → down. Root node:
red halo pulse + Caveat callout. Layout bottom-to-top (roots at bottom).

## Teacher screens

Same world, denser: white data cards on paper; heatmap cells 22–28 px
rounded 4 px, level colours; numbers in Unbounded; generous whitespace
between panels; everything readable from 4 m on a projector.

## Don't

Purple/blue gradients, glassmorphism, blob backgrounds, Inter/Roboto
defaults, emoji as icons (use lucide), centred walls of text, tiny grey
labels, spinners longer than 1 s without text.
