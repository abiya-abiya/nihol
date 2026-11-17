"use client";

import { ArrowRight, LayoutDashboard } from "lucide-react";
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
            <Link href="/teacher">
              <LayoutDashboard aria-hidden />
              <span className="hidden sm:inline">Oʻqituvchi paneli</span>
              <span className="sm:hidden">Oʻqituvchi</span>
            </Link>
          </Button>
        </nav>
      </header>

      <div className="grid flex-1 items-center gap-x-12 gap-y-12 pt-6 pb-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:pt-0 lg:pb-16">
        <div className="flex flex-col">
          <h1 className="text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] sm:text-[3.6rem] xl:text-[4.6rem] 2xl:text-[5.2rem]">
            Xatoning ildizini topadigan SI‑tyutor
          </h1>
          <p className="text-ink-soft mt-6 max-w-[38rem] text-[1.12rem] leading-relaxed sm:text-[1.25rem] 2xl:text-[1.35rem]">
            Ildiz 5–6-sinf oʻquvchisi kasrlarda <span className="text-ink font-semibold">qayerda</span> emas,{" "}
            <span className="text-ink marker font-semibold">nega</span> xato qilayotganini 10 ta savolda topadi. Soʻng
            oʻsha ildizdan boshlanadigan shaxsiy yoʻl tuzadi va oʻzbek tilida tushuntiradi. Oʻqituvchi esa butun sinfni
            jonli koʻradi.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild className="h-14 rounded-[16px] px-6 text-[1.08rem] font-semibold shadow-[var(--shadow-lift)]">
              <Link href="/start?class=6a">
                Diagnostikani boshlash
                <ArrowRight aria-hidden className="size-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-ink h-14 rounded-[16px] border-2 bg-white px-6 text-[1.08rem] font-semibold"
            >
              <Link href="/teacher">Sinf panelini koʻrish</Link>
            </Button>
          </div>
          <p className="text-ink-soft mt-4 text-sm">Roʻyxatdan oʻtish shart emas · internet uzilsa ham ishlaydi</p>
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
              title="Ildizdan boshlang"
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
