"use client";

import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** Pulsing "Jonli" dot while polling works; "Aloqa yo'q" once data is stale. */
export function LiveBadge({ stale, className }: { stale: boolean; className?: string }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors",
        stale ? "border-shaky/40 bg-shaky/10 text-[#8a5a00]" : "border-mastered/30 bg-mastered/10 text-[#1f6e3e]",
        className,
      )}
    >
      {stale ? (
        <>
          <WifiOff className="size-4" aria-hidden />
          Aloqa yöq — oxirgi maʼlumot
        </>
      ) : (
        <>
          <span className="relative grid size-2.5 place-items-center" aria-hidden>
            <span className="bg-mastered absolute inline-flex size-full animate-ping rounded-full opacity-60" />
            <span className="bg-mastered relative inline-flex size-2.5 rounded-full" />
          </span>
          Jonli
        </>
      )}
    </span>
  );
}
