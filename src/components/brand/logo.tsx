import { cn } from "@/lib/utils";

/** A young sprout (nihol) with two leaves, growing out of a soil mound. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden className={cn("logo-mark", className)}>
      <path d="M20 30V19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M20 23C19.6 15.4 14.2 10.6 6.6 11.2 6.9 18.8 12.4 23.4 20 23Z" fill="var(--mastered)" />
      <path d="M20 19.5C20.6 12.4 26 7.6 33.4 8.2 33 15.4 27.6 19.9 20 19.5Z" fill="var(--mastered)" opacity="0.82" />
      <path d="M18.6 21.6C15.6 18.2 12.6 15.4 9.2 13.4M21.4 18.2C24.4 15 27.6 12.4 31 10.4" stroke="white" strokeOpacity={0.55} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M7 35.2C9.6 31.4 14.4 29.4 20 29.4S30.4 31.4 33 35.2Z" fill="currentColor" />
    </svg>
  );
}

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      <span className="logo-word font-display font-bold tracking-tight" style={{ fontSize: size * 0.68 }}>
        Nihol
      </span>
    </span>
  );
}
