import { Fragment, type ReactNode } from "react";
import { normalizeUz } from "@/lib/uz";
import { cn } from "@/lib/utils";
import { Frac } from "./frac";

const TOKEN = /(\[\[[^\]]+\]\]|\*\*[^*]+\*\*)/g;
const FRACTION = /^\s*(?:(-?\d+)\s+)?(-?\d+)\s*\/\s*(\d+)\s*$/;

function renderInline(line: string, size: "sm" | "md" | "lg", keyBase: string): ReactNode[] {
  return line.split(TOKEN).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith("[[") && part.endsWith("]]")) {
      const m = FRACTION.exec(part.slice(2, -2));
      if (!m) return <Fragment key={key}>{normalizeUz(part.slice(2, -2))}</Fragment>;
      return <Frac key={key} whole={m[1] ? Number(m[1]) : undefined} n={Number(m[2])} d={Number(m[3])} size={size} />;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold">
          {renderInline(part.slice(2, -2), size, key)}
        </strong>
      );
    }
    return <Fragment key={key}>{normalizeUz(part)}</Fragment>;
  });
}

/**
 * Renders content markup: [[3/4]] fractions, [[2 1/3]] mixed numbers, **bold**,
 * newlines as paragraphs. Uzbek apostrophes are normalised.
 */
export function MathText({
  text,
  className,
  fracSize = "md",
  as = "div",
}: {
  text: string;
  className?: string;
  fracSize?: "sm" | "md" | "lg";
  as?: "div" | "span";
}) {
  const lines = text.split(/\n+/).filter((l) => l.trim().length > 0);
  if (as === "span" || lines.length <= 1) {
    const Tag = as;
    return <Tag className={cn("leading-[1.9]", className)}>{renderInline(lines[0] ?? "", fracSize, "l0")}</Tag>;
  }
  return (
    <div className={cn("space-y-2 leading-[1.9]", className)}>
      {lines.map((l, i) => (
        <p key={i}>{renderInline(l, fracSize, `l${i}`)}</p>
      ))}
    </div>
  );
}
