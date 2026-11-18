"use client";

import { ArrowRight, LogIn } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { QrCard } from "./qr-card";
import { RootTrace } from "./root-trace";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({ studentUrl }: { studentUrl: string }) {
  const reduce = useReducedMotion();
  return (
    <section className="relative mx-auto flex w-full max-w-[1500px] flex-col px-5 sm:px-8 lg:min-h-dvh lg:px-12">
      <header className="flex items-center justify-between py-5">
        <Logo size={38} />
        <nav aria-label="Asosiy" className="flex items-center gap-2">
          <Button asChild variant="ghost" className="h-11 rounded-[14px] px-3.5 text-[0.95rem] font-semibold">
            <Link href="/login">
              <LogIn aria-hidden />
              Kiriş
            </Link>
          </Button>
        </nav>
      </header>

      <div className="grid flex-1 items-center gap-x-12 gap-y-12 pt-6 pb-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:pt-0 lg:pb-16">
        <div className="flex flex-col">
          <p className="text-ink-soft mb-4 text-sm font-semibold tracking-wide uppercase">Maktab uçun eng yaxşi SI‑vosita</p>
          <h1 className="text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] sm:text-[3.6rem] xl:text-[4.6rem] 2xl:text-[5.2rem]">
            Xatoning ildizini topadigan SI‑tyutor
          </h1>
          <p className="text-ink-soft mt-6 max-w-[38rem] text-[1.12rem] leading-relaxed sm:text-[1.25rem] 2xl:text-[1.35rem]">
            Dars materialini yuklaysiz, Nihol <span className="text-ink font-semibold">test tayyorlaydi</span>. Öquvçi
            telefonda yeçadi, öqituvçi butun sinfni jonli köradi, ota‑ona esa bolasining{" "}
            <span className="text-ink marker font-semibold">har bir fan böyiça xaritasini</span>. Matematikada SI xatoning
            asl sababini — ildizini — topadi.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild className="h-16 rounded-[18px] px-9 text-[1.2rem] font-bold shadow-[var(--shadow-lift)]">
              <Link href="/login">
                Kiriş
                <ArrowRight aria-hidden className="size-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-ink h-14 rounded-[16px] border-2 bg-white px-6 text-[1.08rem] font-semibold"
            >
              <Link href="/start?class=6a">Sinab köriş</Link>
            </Button>
          </div>
          <p className="text-ink-soft mt-4 text-sm">
            4 ta fan · 3 ta rol: öqituvçi, öquvçi, ota‑ona · internet uzilsa ham işlaydi
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <RootTrace className="lg:self-start" />
          <motion.div
            className="relative hidden shrink-0 lg:block"
            initial={reduce ? false : { opacity: 0, y: 24, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: 2 }}
            transition={reduce ? { duration: 0 } : { duration: 0.7, ease: EASE, delay: 3.7 }}
          >
            <span
              aria-hidden
              className="bg-highlight/70 absolute -top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2 -rotate-3 rounded-[3px]"
            />
            <QrCard
              url={studentUrl}
              title="Sinab köriş"
              caption="Telefoningiz kamerasi bilan skanerlang"
              size={256}
              className="w-[268px] 2xl:w-[330px]"
              qrClassName="w-[196px] 2xl:w-[256px]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
