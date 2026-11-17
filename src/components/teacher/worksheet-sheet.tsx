"use client";

import { ArrowLeft, Loader2, Printer, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { LogoMark } from "@/components/brand/logo";
import { MathText } from "@/components/brand/math-text";
import { Button } from "@/components/ui/button";
import { misconceptionsById } from "@/lib/content";
import type { Worksheet, WorksheetRequest } from "@/lib/types";
import { skillTitle } from "@/lib/teacher/view";
import { normalizeUz } from "@/lib/uz";

const PRINT_CSS = `
@page { size: A4; margin: 0; }
.ws-page {
  width: 210mm; height: 297mm; padding: 13mm 15mm 12mm;
  background: #fff; color: var(--ink); overflow: hidden;
  display: flex; flex-direction: column;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.ws-task { break-inside: avoid; }
@media print {
  html, body { background: #fff !important; }
  body { background-image: none !important; }
  .no-print { display: none !important; }
  .ws-stack { gap: 0 !important; padding: 0 !important; }
  .ws-page { box-shadow: none !important; border: 0 !important; border-radius: 0 !important; break-after: page; }
  .ws-page:last-child { break-after: auto; }
}
`;

export function WorksheetView({
  request,
  className,
  groupSize,
}: {
  request: WorksheetRequest;
  className: string;
  groupSize: number | null;
}) {
  const [seed, setSeed] = useState(1);
  const { data: ws, error, isLoading: loading, mutate } = useSWR<Worksheet>(
    ["worksheet", JSON.stringify(request), seed],
    async () => {
      const res = await fetch(`/api/teacher/worksheet?seed=${seed}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true, shouldRetryOnError: false },
  );

  const root = request.skillIds[0];
  const hasAi = !!ws?.items.some((i) => i.source === "ai");
  const drills = ws?.items.filter((i) => !i.skillId.startsWith("frac-word") && i.source === "generated") ?? [];
  const words = ws?.items.filter((i) => i.source === "ai" || i.skillId === "frac-word") ?? [];
  const mis = (request.misconceptionIds ?? []).map((id) => misconceptionsById[id]).filter(Boolean);

  return (
    <div className="flex flex-col">
      <style>{PRINT_CSS}</style>

      <div className="no-print sticky top-0 z-30 border-b border-border bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-3 px-5 py-3">
          <Button asChild variant="ghost" className="h-10 rounded-[14px] px-3 text-sm font-semibold">
            <Link href="/teacher">
              <ArrowLeft aria-hidden />
              {normalizeUz(className)}
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg leading-tight font-bold">Mashq varaqasi</h1>
            <p className="text-ink-soft text-sm">
              Ildiz: <span className="font-semibold">{skillTitle(root)}</span>
              {groupSize ? ` · ${groupSize} oʻquvchi uchun` : ""}
              {hasAi ? " · matnli masalalarni AI yozdi" : ""}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-[14px] border-2 border-ink px-4 text-sm font-semibold"
              onClick={() => setSeed((s) => s + 1)}
              disabled={loading}
            >
              <RefreshCw aria-hidden className={loading ? "animate-spin" : undefined} />
              Yangi variant
            </Button>
            <Button
              className="h-10 rounded-[14px] px-4 text-sm font-semibold"
              onClick={() => window.print()}
              disabled={!ws || loading}
            >
              <Printer aria-hidden />
              Chop etish
            </Button>
          </div>
        </div>
      </div>

      <div className="ws-stack flex flex-col items-center gap-8 px-4 py-8">
        {error && !ws ? (
          <div className="sheet no-print flex max-w-md flex-col items-center gap-3 p-8 text-center">
            <p className="font-semibold">Varaqani tayyorlab boʻlmadi.</p>
            <p className="text-ink-soft text-sm">Aloqani tekshirib, qayta urinib koʻring.</p>
            <Button className="h-10 rounded-[14px] px-4" onClick={() => mutate()}>
              Qayta urinish
            </Button>
          </div>
        ) : !ws ? (
          <div className="ws-page sheet no-print items-center justify-center gap-3 text-center">
            <Loader2 className="text-ink-soft size-8 animate-spin" aria-hidden />
            <p className="font-semibold">Varaqa tayyorlanmoqda…</p>
            <p className="text-ink-soft max-w-xs text-sm">
              Misollar hisoblanmoqda, AI esa matnli masalalarni yozmoqda. Bu 10–20 soniya olishi mumkin.
            </p>
          </div>
        ) : (
          <>
            {/* Page 1: tasks */}
            <article className="ws-page sheet relative" aria-label="1-bet: topshiriqlar">
              {loading && (
                <div className="no-print absolute inset-0 z-10 grid place-items-center rounded-[inherit] bg-white/70">
                  <Loader2 className="text-ink-soft size-8 animate-spin" aria-hidden />
                </div>
              )}
              <header className="flex items-center justify-between border-b-2 border-ink pb-2">
                <span className="flex items-center gap-2">
                  <LogoMark size={26} />
                  <span className="font-display text-[13pt] font-bold">Ildiz</span>
                </span>
                <span className="text-ink-soft text-[10pt] font-medium">
                  {normalizeUz(className)} · Matematika · «Kasrlar»
                </span>
              </header>
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-6 text-[10.5pt]">
                <span className="flex items-end gap-2">
                  Ism, familiya:<span className="mb-[3px] flex-1 border-b border-ink-soft" />
                </span>
                <span className="flex w-[48mm] items-end gap-2">
                  Sana:<span className="mb-[3px] flex-1 border-b border-ink-soft" />
                </span>
              </div>

              <h2 className="mt-4 text-[17pt] leading-tight font-bold">{normalizeUz(ws.title)}</h2>
              <MathText text={ws.intro} className="text-ink-soft mt-1 text-[10.5pt] leading-normal" fracSize="sm" />

              <ol className="mt-4 grid grid-cols-2 gap-x-7 gap-y-3.5">
                {drills.map((it, i) => (
                  <li key={i} className="ws-task flex gap-2.5">
                    <span className="font-display grid size-[7mm] shrink-0 place-items-center rounded-full border-[1.5px] border-ink text-[9.5pt] font-bold">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <MathText text={it.stem} className="text-[11pt] leading-[1.75]" fracSize="md" />
                      <div className="mt-1.5 flex items-end gap-2 text-[9.5pt] text-ink-soft">
                        Javob:
                        <span className="mb-[3px] h-[9mm] flex-1 border-b border-dashed border-ink-soft" />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>

              {words.length > 0 && (
                <>
                  <h3 className="mt-5 border-t border-border pt-3 text-[12pt] font-bold">Matnli masalalar</h3>
                  <ol className="mt-2 flex flex-col gap-3" start={drills.length + 1}>
                    {words.map((it, i) => (
                      <li key={i} className="ws-task flex gap-2.5">
                        <span className="font-display grid size-[7mm] shrink-0 place-items-center rounded-full border-[1.5px] border-ink text-[9.5pt] font-bold">
                          {drills.length + i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <MathText text={it.stem} className="text-[11pt] leading-[1.7]" fracSize="md" />
                          <div className="mt-1 h-[14mm] rounded-md border border-dashed border-grid" />
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              )}

              <footer className="text-ink-soft mt-auto flex justify-between pt-3 text-[8.5pt]">
                <span>Ildiz — xatoning ildizini topadigan SI-tyutor</span>
                <span>1-bet</span>
              </footer>
            </article>

            {/* Page 2: answer key for the teacher */}
            <article className="ws-page sheet" aria-label="2-bet: javoblar kaliti">
              <header className="flex items-center justify-between border-b-2 border-ink pb-2">
                <span className="font-display text-[13pt] font-bold">Javoblar kaliti</span>
                <span className="text-ink-soft text-[10pt] font-medium">Oʻqituvchi uchun · {normalizeUz(ws.title)}</span>
              </header>

              <ol className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2.5">
                {[...drills, ...words].map((it, i) => (
                  <li key={i} className="ws-task flex items-baseline gap-2.5 border-b border-border pb-2">
                    <span className="font-display w-[6mm] shrink-0 text-[10pt] font-bold">{i + 1}.</span>
                    <MathText text={it.answer} className="text-[11pt] font-semibold" fracSize="md" />
                    <span className="text-ink-soft ml-auto shrink-0 text-[8.5pt]">{skillTitle(it.skillId)}</span>
                  </li>
                ))}
              </ol>

              <section className="ws-task mt-6">
                <h3 className="text-[12pt] font-bold">Oʻqituvchiga eslatma</h3>
                <MathText text={ws.teacherNotes} className="mt-1 text-[10.5pt] leading-relaxed" fracSize="sm" />
              </section>

              {mis.length > 0 && (
                <section className="ws-task mt-5">
                  <h3 className="text-[12pt] font-bold">Guruhda kuzatilgan xatolar</h3>
                  <ul className="mt-2 flex flex-col gap-2.5">
                    {mis.map((m) => (
                      <li key={m.id} className="text-[10.5pt] leading-relaxed">
                        <span className="font-semibold">{normalizeUz(m.title)}: </span>
                        <MathText text={m.example} as="span" fracSize="sm" className="text-red-pen font-semibold" />
                        <MathText text={m.remedy} className="text-ink-soft" fracSize="sm" />
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {hasAi && (
                <p className="text-ink-soft mt-5 flex items-center gap-1.5 text-[9pt]">
                  <Sparkles className="size-3.5" aria-hidden />
                  Matnli masalalar matnini AI yozdi; sonlar va javoblar dastur tomonidan hisoblangan.
                </p>
              )}

              <footer className="text-ink-soft mt-auto flex justify-between pt-3 text-[8.5pt]">
                <span>Ildiz — xatoning ildizini topadigan SI-tyutor</span>
                <span>2-bet</span>
              </footer>
            </article>
          </>
        )}
      </div>
    </div>
  );
}
