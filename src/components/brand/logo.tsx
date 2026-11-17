import { cn } from "@/lib/utils";

/** Sprout above the soil line, roots below; one root tip glows red (the gap we find). */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden className={className}>
      <path d="M20 21V11" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M20 14c-1-5-6-7-10-6 1 5 5 7 10 6Z" fill="var(--mastered)" />
      <path d="M20 12c1.5-4.5 6-6 9.5-5-.8 4.6-5 6.4-9.5 5Z" fill="var(--mastered)" opacity="0.8" />
      <path d="M7 21.5h26" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M20 21.5c0 4-3 6-6 8.5M20 21.5c0 3.5 2.5 5 5.5 6.5M20 21.5v9.5"
        stroke="var(--ink-soft)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="20" cy="33" r="2.6" fill="var(--red-pen)" />
    </svg>
  );
}

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      <span className="font-display text-ink font-bold tracking-tight" style={{ fontSize: size * 0.68 }}>
        Ildiz
      </span>
    </span>
  );
}
