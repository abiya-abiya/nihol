import { Atom, Bug, FlaskConical, Flower2, Leaf, type LucideIcon, Sprout, TestTube } from "lucide-react";
import { cn } from "@/lib/utils";

type Glyph = string | LucideIcon;

/** Each default subject gets its own motif; teacher-made subjects fall back to letters. */
const MOTIFS: Record<string, { color: string; glyphs: Glyph[] }> = {
  matematika: { color: "#1d4ed8", glyphs: ["½", "⅓ + ¼", "×", "=", "EKUK", "¾", "÷", "%", "2⅓", "π"] },
  "ona-tili": { color: "#be185d", glyphs: ["Ö", "Ğ", "Ş", "Ç", "ʼ", "Aa", "«söz»", "Ot", "Feʼl", "Gap"] },
  "ingliz-tili": { color: "#7c3aed", glyphs: ["ABC", "the", "is", "are", "Hello!", "Aa", "I am", "?", "went", "in · on · at"] },
  biologiya: { color: "#0e7490", glyphs: [Leaf, Sprout, Flower2, Bug, Leaf, "hujayra", Sprout, Flower2, "ildiz", Leaf] },
  kimyo: { color: "#c2410c", glyphs: [FlaskConical, "H₂O", Atom, "CO₂", TestTube, "O₂", FlaskConical, "NaCl", Atom, "H₂"] },
};
const FALLBACK: Glyph[] = ["Aa", "?", "!", "✓", "Aa", "?", "!", "✓", "Aa", "?"];

// Fixed scatter (percent of the viewport) so server and client render the same layout.
const SPOTS = [
  [4, 10, -8], [86, 8, 6], [12, 34, 5], [90, 30, -6], [3, 58, 10],
  [88, 54, -10], [10, 84, -4], [84, 82, 8], [46, 92, 4], [52, 4, -5],
] as const;

/**
 * Full-screen background themed per subject: the subject colour as a soft wash plus its motif.
 * "paper" sits under ink text (student pages); "board" is a subject-tinted chalkboard (teacher pages).
 */
export function SubjectBackdrop({ subjectId, color, tone = "paper" }: { subjectId: string; color?: string; tone?: "paper" | "board" }) {
  const motif = MOTIFS[subjectId];
  const c = color ?? motif?.color ?? "#1d2b64";
  const glyphs = motif?.glyphs ?? FALLBACK;
  const board = tone === "board";
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden"
      style={{
        background: board
          ? `radial-gradient(120% 90% at 50% 25%, color-mix(in oklab, ${c} 32%, #2c5a4d) 0%, color-mix(in oklab, ${c} 22%, #16322b) 100%)`
          : `radial-gradient(90% 60% at 50% 0%, color-mix(in oklab, ${c} 14%, var(--paper)) 0%, var(--paper) 70%)`,
      }}
    >
      {SPOTS.map(([x, y, rot], i) => {
        const G = glyphs[i % glyphs.length];
        return (
          <span
            key={i}
            className={cn("font-hand absolute text-[2.4rem] leading-none font-bold whitespace-nowrap sm:text-[3rem]", i % 3 === 2 && "hidden sm:block")}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `rotate(${rot}deg)`,
              color: board ? "rgb(246 243 234 / 0.16)" : `color-mix(in oklab, ${c} 30%, transparent)`,
            }}
          >
            {typeof G === "string" ? G : <G className="size-12 sm:size-14" strokeWidth={1.6} />}
          </span>
        );
      })}
    </div>
  );
}
