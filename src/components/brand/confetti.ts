"use client";

import confetti from "canvas-confetti";

const COLORS = ["#2f9e5b", "#ffe45c", "#1d2b64", "#e5484d", "#7cc58f"];

/** Celebrate a correct answer ("small") or a completed skill ("big"). No-op with reduced motion. */
export function celebrate(kind: "small" | "big" = "small", origin?: { x: number; y: number }) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (kind === "small") {
    void confetti({
      particleCount: 36,
      spread: 55,
      startVelocity: 28,
      scalar: 0.8,
      ticks: 90,
      colors: COLORS,
      origin: origin ?? { x: 0.5, y: 0.7 },
      disableForReducedMotion: true,
    });
    return;
  }
  const end = Date.now() + 900;
  const frame = () => {
    void confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: COLORS });
    void confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
