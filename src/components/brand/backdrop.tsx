import { cn } from "@/lib/utils";

/** Chalk notes from different subjects, so the board never reads as a maths-only app. */
const CHALK: Array<{ text: string; className: string }> = [
  { text: "½ + ⅓ = ⅚", className: "left-[5%] top-[9%] -rotate-6" },
  { text: "Ö · Ğ · Ş · Ç", className: "right-[6%] top-[6%] rotate-3 hidden sm:block" },
  { text: "2H₂ + O₂ → 2H₂O", className: "right-[7%] bottom-[10%] -rotate-3" },
  { text: "I am · you are", className: "left-[6%] bottom-[14%] rotate-6 hidden sm:block" },
];

/** Off since the knowledge map: notes overlapped its nodes. Kept for a quick switch back. */
const SHOW_CHALK = false;

// Subject pastels: maths, ona tili, ingliz tili, biologiya, kimyo.
const PAST = ["#8fb7ff", "#ff8a7a", "#b9a6ff", "#7fd1a4", "#ffd84d"];

// Line icons in a ~48-unit box around 0,0: s = outline, f = filled part.
const SHAPES: Record<string, { s: string; f: string }> = {
  frac: { s: "M0-20V20M-20 0H20M20 0A20 20 0 1 1-20 0A20 20 0 1 1 20 0", f: "M0 0V-20A20 20 0 0 1 20 0Z" },
  leaf: { s: "M-16 16C-16-6 0-18 18-18C18 4 4 16-16 16ZM-16 16L8-8", f: "M-16 16C-16-6 0-18 18-18C18 4 4 16-16 16Z" },
  flask: { s: "M-7-20H7M-4-20V-6L-16 14Q-18 20-12 20H12Q18 20 16 14L4-6V-20", f: "M-11 6H11L15 14Q16 18 12 18H-12Q-16 18-15 14Z" },
  book: {
    s: "M0-12C-6-17-14-17-20-14V16C-14 13-6 13 0 18C6 13 14 13 20 16V-14C14-17 6-17 0-12ZM0-12V18",
    f: "M0-12C-6-17-14-17-20-14V16C-14 13-6 13 0 18Z",
  },
  globe: { s: "M20 0A20 20 0 1 1-20 0A20 20 0 1 1 20 0M0-20C-12-8-12 8 0 20C12 8 12-8 0-20M-20 0H20M-17-10H17M-17 10H17", f: "M-20 0A20 20 0 0 1 0-20V0Z" },
};

/** Knowledge map: subjects are nodes, prerequisites are edges. One tile, repeated. */
const NODES: Array<[number, number, string, number]> = [
  [70, 80, "frac", 0], [230, 60, "Ö", 1], [400, 110, "leaf", 3], [140, 220, "ABC", 2], [310, 240, "flask", 4],
  [470, 280, "π", 0], [60, 380, "book", 1], [220, 390, "H₂O", 4], [390, 420, "globe", 3], [520, 40, "Aa", 2],
];
const EDGES: Array<[number, number]> = [
  [0, 1], [1, 3], [0, 3], [1, 2], [2, 4], [3, 4], [4, 5], [3, 6], [6, 7], [7, 4], [7, 8], [5, 8], [2, 9], [9, 5],
];
const CHALK_RGB = "246 243 234";

function MapTile() {
  return (
    <>
      {EDGES.map(([a, b]) => (
        <path
          key={`${a}-${b}`}
          d={`M${NODES[a][0]} ${NODES[a][1]}L${NODES[b][0]} ${NODES[b][1]}`}
          stroke={`rgb(${CHALK_RGB} / 0.15)`}
          strokeWidth={1.6}
          strokeDasharray={(a + b) % 3 ? undefined : "5 6"}
        />
      ))}
      {NODES.map(([x, y, k, ci]) => {
        const shape = SHAPES[k];
        return (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
            <circle r={30} fill="rgb(22 50 43 / 0.6)" stroke={PAST[ci]} strokeOpacity={0.45} strokeWidth={2.4} />
            {shape ? (
              <g transform="scale(0.8)">
                <path d={shape.f} fill={PAST[ci]} fillOpacity={0.3} />
                <path d={shape.s} fill="none" stroke={`rgb(${CHALK_RGB} / 0.24)`} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            ) : (
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fill={`rgb(${CHALK_RGB} / 0.3)`}
                style={{ fontFamily: "var(--font-caveat), cursive", fontWeight: 700, fontSize: k.length > 2 ? 22 : 28 }}
              >
                {k}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

/**
 * Fixed full-screen page background. "doska" = chalkboard with a knowledge map of all subjects
 * (hero screens), "bolak" = pastel pieces on paper (reading screens). Decorative only.
 */
export function Backdrop({ variant, formulas = true }: { variant: "doska" | "bolak"; formulas?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden", variant === "doska" ? "bg-doska" : "bg-bolak")}
    >
      {variant === "doska" && (
        <svg
          className="absolute inset-0 size-full"
          style={{
            // calmer behind the content column, full strength at the edges
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, rgb(0 0 0 / 0.38) 0%, rgb(0 0 0 / 0.6) 55%, #000 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, rgb(0 0 0 / 0.38) 0%, rgb(0 0 0 / 0.6) 55%, #000 100%)",
          }}
        >
          <defs>
            <pattern id="nihol-map" width={580} height={480} patternUnits="userSpaceOnUse" patternTransform="scale(0.86) translate(-20 -10)">
              <MapTile />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#nihol-map)" />
        </svg>
      )}
      {variant === "doska" &&
        formulas &&
        SHOW_CHALK &&
        CHALK.map((c) => (
          <span key={c.text} className={cn("font-hand absolute text-3xl whitespace-nowrap text-[rgb(246_243_234/0.2)]", c.className)}>
            {c.text}
          </span>
        ))}
    </div>
  );
}
