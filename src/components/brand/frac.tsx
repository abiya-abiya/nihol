import { cn } from "@/lib/utils";

const SIZES = {
  sm: { num: "text-[0.8em]", gap: "gap-[0.08em]", bar: "h-[1.5px]", whole: "text-[1em]" },
  md: { num: "text-[0.92em]", gap: "gap-[0.1em]", bar: "h-[2px]", whole: "text-[1.15em]" },
  lg: { num: "text-[1.1em]", gap: "gap-[0.12em]", bar: "h-[2.5px]", whole: "text-[1.4em]" },
} as const;

/** Stacked fraction, optionally with a whole part: <Frac whole={2} n={1} d={3} /> */
export function Frac({
  n,
  d,
  whole,
  size = "md",
  className,
}: {
  n: number;
  d: number;
  whole?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span
      className={cn("tabular mx-[0.12em] inline-flex items-center align-middle leading-none", className)}
      role="math"
      aria-label={`${whole ? `${whole} butun ` : ""}${n}/${d}`}
    >
      {whole !== undefined && whole !== 0 && <span className={cn("mr-[0.12em] font-semibold", s.whole)}>{whole}</span>}
      <span className={cn("inline-flex flex-col items-center font-semibold", s.gap, s.num)}>
        <span className="px-[0.15em]">{n}</span>
        <span className={cn("w-full rounded-full bg-current", s.bar)} />
        <span className="px-[0.15em]">{d}</span>
      </span>
    </span>
  );
}
