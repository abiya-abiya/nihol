"use client";

import { Check, Lock } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEW = { once: true, amount: 0.45 } as const;

function Step({
  n,
  title,
  body,
  children,
}: {
  n: number;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <li className="flex flex-col gap-5">
      <div className="bg-white/70 border-border relative grid h-[230px] place-items-center overflow-hidden rounded-[22px] border">
        {children}
      </div>
      <div className="flex gap-4">
        <span className="font-display border-ink grid size-10 shrink-0 place-items-center rounded-full border-2 text-lg font-bold">
          {n}
        </span>
        <div>
          <h3 className="text-[1.3rem] leading-tight font-bold">{title}</h3>
          <p className="text-ink-soft mt-1.5 text-[1.02rem] leading-relaxed">{body}</p>
        </div>
      </div>
    </li>
  );
}

/** Step 1: one question, a wrong choice struck through, the next question goes one level down. */
function DiagnosticArt() {
  const reduce = useReducedMotion();
  const choices = ["Ildizda", "Bargda", "Poyada", "Gulda"];
  return (
    <div className="w-[250px]">
      <p className="text-ink-soft mb-1 text-xs font-semibold">Biologiya · 3 / 5 savol</p>
      <p className="font-display mb-3 text-[1.05rem] leading-snug font-bold">Fotosintez qayerda boradi?</p>
      <ul className="grid grid-cols-2 gap-2">
        {choices.map((c, i) => {
          const wrong = i === 0;
          return (
            <li
              key={c}
              className={cn(
                "relative flex h-10 items-center gap-2 rounded-xl border bg-white px-3 text-[0.95rem] font-semibold",
                wrong ? "border-red-pen" : "border-border",
              )}
            >
              <span className="bg-ink-wash grid size-5 place-items-center rounded-full text-[0.65rem] font-bold">
                {"abcd"[i]}
              </span>
              {c}
              {wrong && (
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
                  <motion.path
                    d="M 8 30 L 92 10"
                    stroke="var(--red-pen)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={reduce ? false : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={VIEW}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  />
                </svg>
              )}
            </li>
          );
        })}
      </ul>
      <motion.p
        className="font-hand text-red-pen mt-3 text-[1.35rem] leading-none font-bold"
        initial={reduce ? false : { opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEW}
        transition={{ duration: 0.4, delay: 1.0, ease: EASE }}
      >
        öqituvçi tahrirlab, sinfga yuboradi
      </motion.p>
    </div>
  );
}

/** Step 2: a small graph; the red trace runs down to the root, which pulses. */
function GraphArt() {
  const reduce = useReducedMotion();
  // x, y in a 260x180 box; rows from top (topic) to bottom (roots).
  const nodes = {
    a: [130, 26],
    b: [70, 74],
    c: [190, 74],
    d: [40, 122],
    e: [130, 122],
    f: [220, 122],
    g: [90, 164],
    h: [180, 164],
  } as const;
  const edges: Array<[keyof typeof nodes, keyof typeof nodes]> = [
    ["a", "b"],
    ["a", "c"],
    ["b", "d"],
    ["b", "e"],
    ["c", "e"],
    ["c", "f"],
    ["d", "g"],
    ["e", "g"],
    ["e", "h"],
    ["f", "h"],
  ];
  const trace: Array<keyof typeof nodes> = ["a", "b", "e", "h"];
  const traceD = trace.map((k, i) => `${i ? "L" : "M"} ${nodes[k][0]} ${nodes[k][1]}`).join(" ");
  const color = (k: string) =>
    k === "h" ? "var(--red-pen)" : trace.includes(k as never) ? "var(--shaky)" : "var(--mastered)";
  return (
    <svg viewBox="0 0 260 190" className="h-[200px] w-[270px]" aria-hidden>
      {edges.map(([p, q]) => (
        <line
          key={p + q}
          x1={nodes[p][0]}
          y1={nodes[p][1]}
          x2={nodes[q][0]}
          y2={nodes[q][1]}
          stroke="var(--ink-soft)"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
      ))}
      <motion.path
        d={traceD}
        fill="none"
        stroke="var(--red-pen)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={VIEW}
        transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
      />
      {!reduce && (
        <motion.circle
          cx={nodes.h[0]}
          cy={nodes.h[1]}
          r="14"
          fill="var(--red-pen)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: [0, 0.3, 0.1, 0.3] }}
          viewport={VIEW}
          transition={{ duration: 1.6, delay: 1.5, repeat: Infinity, repeatDelay: 0.8 }}
        />
      )}
      {Object.entries(nodes).map(([k, [x, y]]) => (
        <circle key={k} cx={x} cy={y} r="8.5" fill="white" stroke={color(k)} strokeWidth="3.5" />
      ))}
      <motion.text
        x={nodes.h[0] + 18}
        y={nodes.h[1] + 6}
        className="font-hand"
        fontSize="19"
        fontWeight="700"
        fill="var(--red-pen)"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEW}
        transition={{ delay: 1.6 }}
      >
        ildiz
      </motion.text>
    </svg>
  );
}

/** Step 3: the path grows upward from the root. */
function PathArt() {
  const reduce = useReducedMotion();
  const steps = [
    { label: "Barg va fotosintez", state: "locked" },
    { label: "Ösimlik töqimalari", state: "locked" },
    { label: "Hujayra tuzilişi", state: "current" },
  ] as const;
  return (
    <div className="relative flex w-[230px] flex-col gap-3 pl-8">
      <motion.span
        aria-hidden
        className="bg-mastered absolute top-3 bottom-3 left-[13px] w-[3px] origin-bottom rounded-full"
        initial={reduce ? false : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={VIEW}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      />
      {steps.map((s, i) => (
        <motion.div
          key={s.label}
          className="relative flex items-center gap-2.5"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW}
          transition={{ duration: 0.4, ease: EASE, delay: 0.3 + (steps.length - 1 - i) * 0.25 }}
        >
          <span
            className={cn(
              "absolute -left-8 grid size-[26px] place-items-center rounded-full border-2 border-white",
              s.state === "current" ? "bg-ink text-white" : "bg-ink-wash text-ink-soft",
            )}
          >
            {s.state === "current" ? <Check className="size-3.5" strokeWidth={3} /> : <Lock className="size-3" />}
          </span>
          <span
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[0.95rem] font-semibold",
              s.state === "current" ? "border-ink bg-white" : "border-border text-ink-soft bg-white/70",
            )}
          >
            {s.label}
          </span>
        </motion.div>
      ))}
      <span className="font-hand text-mastered mt-1 text-[1.3rem] leading-none font-bold">şu yerdan boşlaymiz</span>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="mx-auto w-full max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12">
      <h2 id="how-title" className="text-[2rem] leading-tight font-bold sm:text-[2.6rem]">
        Qanday işlaydi
      </h2>
      <ol className="mt-10 grid gap-x-10 gap-y-14 md:grid-cols-3">
        <Step
          n={1}
          title="Materialdan test"
          body="Öqituvçi dars materialini (PDF yoki Word) yuklaydi. Nihol uni öqib çiqadi, asosiy tuşunçalarni topadi va beş savollik test tayyorlaydi. Öqituvçi tahrirlaydi va sinfga yuboradi."
        >
          <DiagnosticArt />
        </Step>
        <Step
          n={2}
          title="Ildizni topiş"
          body="Öquvçi testni telefonda yeçadi. Bilim grafi va Bayes modeli xatoni pastga qarab kuzatadi va asl böşliqni topadi. Har bir xulosa öquvçining javoblariga asoslangan."
        >
          <GraphArt />
        </Step>
        <Step
          n={3}
          title="Hamma öz xaritasini köradi"
          body="Öquvçi şaxsiy yöl va SI‑tyutorni oladi, ota‑ona bolasining har bir fan böyiça xaritasi va ösişini köradi, öqituvçi esa butun sinfni jonli köradi."
        >
          <PathArt />
        </Step>
      </ol>
    </section>
  );
}
