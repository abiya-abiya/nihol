"use client";

import { celebrate } from "@/components/brand/confetti";
import { Frac } from "@/components/brand/frac";
import { LEVELS, levelColor, levelLabel } from "@/components/brand/levels";
import { Logo, LogoMark } from "@/components/brand/logo";
import { MasteryRing } from "@/components/brand/mastery-ring";
import { MathText } from "@/components/brand/math-text";
import { FadeIn, Stagger, StaggerItem } from "@/components/brand/motion";
import { Button } from "@/components/ui/button";

const SWATCHES = ["paper", "grid", "ink", "ink-soft", "ink-wash", "red-pen", "mastered", "shaky", "unknown", "highlight"];

/** Reference page for the design system (A2). B and C: look here before styling. */
export default function KitPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-10 px-4 py-10 sm:px-8">
      <FadeIn className="flex flex-wrap items-center justify-between gap-4">
        <Logo size={44} />
        <p className="font-hand text-red-pen text-2xl -rotate-2">dizayn tizimi</p>
      </FadeIn>

      <section className="sheet space-y-4 p-6">
        <h2 className="text-xl font-semibold">Ranglar</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {SWATCHES.map((s) => (
            <div key={s} className="space-y-1">
              <div className="h-14 rounded-xl border" style={{ background: `var(--${s})` }} />
              <p className="text-muted-foreground text-xs">--{s}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sheet space-y-4 p-6">
        <h2 className="text-xl font-semibold">Shriftlar</h2>
        <p className="font-display text-4xl font-bold sm:text-5xl">Xatoning ildizini topamiz</p>
        <p className="font-display text-2xl font-semibold">Oʻquvchi, gʻalaba, maʼlumot — Oʻ Gʻ ʼ</p>
        <p className="max-w-prose text-lg">
          Bu matn Onest shriftida. Oʻzbek harflari: oʻ, gʻ, tutuq belgisi — maʼno, sanʼat. Sonlar:{" "}
          <span className="tabular">0123456789</span>.
        </p>
        <p className="font-hand text-red-pen text-3xl">ildiz shu yerda!</p>
        <p className="text-lg">
          Kalit soʻz <span className="marker">umumiy maxraj</span> bilan belgilanadi.
        </p>
      </section>

      <section className="sheet space-y-4 p-6">
        <h2 className="text-xl font-semibold">Kasrlar va MathText</h2>
        <div className="flex flex-wrap items-end gap-6 text-3xl">
          <Frac n={3} d={4} size="sm" />
          <Frac n={3} d={4} />
          <Frac n={11} d={12} size="lg" />
          <Frac whole={2} n={1} d={3} size="lg" />
        </div>
        <MathText
          className="text-lg"
          text={"Hisobla: [[1/2]] + [[1/3]] = ?\nNotoʻgʻri: [[1/2]] + [[1/3]] = [[2/5]] — **suratlar va maxrajlar alohida qoʻshilmaydi**.\nToʻgʻri: EKUK(2, 3) = 6, demak [[3/6]] + [[2/6]] = [[5/6]]. Aralash son: [[2 1/3]]."}
        />
      </section>

      <section className="sheet space-y-4 p-6">
        <h2 className="text-xl font-semibold">Oʻzlashtirish darajalari</h2>
        <Stagger className="flex flex-wrap gap-6">
          {LEVELS.map((l, i) => (
            <StaggerItem key={l} className="flex items-center gap-3">
              <MasteryRing p={[0.92, 0.64, 0.18, 0][i]} level={l} size={64} />
              <span className="flex items-center gap-2 text-sm">
                <span className="size-3 rounded-full" style={{ background: levelColor(l) }} />
                {levelLabel(l)}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="sheet space-y-4 p-6">
        <h2 className="text-xl font-semibold">Tugmalar</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">Boshlash</Button>
          <Button size="lg" variant="outline">
            Xaritam
          </Button>
          <Button size="lg" variant="secondary">
            Maslahat
          </Button>
          <Button size="lg" variant="ghost">
            Bekor qilish
          </Button>
          <Button size="lg" variant="outline" onClick={() => celebrate("small")}>
            Kichik konfetti
          </Button>
          <Button size="lg" variant="outline" onClick={() => celebrate("big")}>
            Katta konfetti
          </Button>
          <LogoMark size={40} />
        </div>
      </section>
    </main>
  );
}
