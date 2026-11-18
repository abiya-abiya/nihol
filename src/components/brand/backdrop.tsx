import { cn } from "@/lib/utils";

const CHALK: Array<{ text: string; className: string }> = [
  { text: "½ + ⅓ = ⅚", className: "left-[5%] top-[9%] -rotate-6" },
  { text: "EKUK(4, 6) = 12", className: "right-[6%] top-[6%] rotate-3 hidden sm:block" },
  { text: "¾ · ⅔ = ½", className: "right-[7%] bottom-[10%] -rotate-3" },
  { text: "2⅓ = 7/3", className: "left-[6%] bottom-[14%] rotate-6 hidden sm:block" },
];

/**
 * Fixed full-screen page background. "doska" = chalkboard (hero screens),
 * "bolak" = pastel fraction pieces on paper (reading screens). Decorative only.
 */
export function Backdrop({ variant, formulas = true }: { variant: "doska" | "bolak"; formulas?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 -z-10 print:hidden", variant === "doska" ? "bg-doska" : "bg-bolak")}
    >
      {variant === "doska" &&
        formulas &&
        CHALK.map((c) => (
          <span key={c.text} className={cn("font-hand absolute text-3xl whitespace-nowrap text-[rgb(246_243_234/0.2)]", c.className)}>
            {c.text}
          </span>
        ))}
    </div>
  );
}
