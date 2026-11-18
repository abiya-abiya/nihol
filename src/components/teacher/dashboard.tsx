"use client";

import { ArrowLeft, Loader2, MoreHorizontal, QrCode, RotateCcw } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { levelOf } from "@/engine/bkt";
import type { ClassReport } from "@/lib/types";
import { groupStudents } from "@/lib/teacher/view";
import { normalizeUz } from "@/lib/uz";
import { ActivityFeed } from "./activity-feed";
import { Heatmap } from "./heatmap";
import { KpiTiles } from "./kpi-tiles";
import { LiveBadge } from "./live-badge";
import { Misconceptions } from "./misconceptions";
import { RootGaps } from "./root-gaps";

const POLL_MS = 3000;
const STALE_MS = 10_000;

async function fetchReport(url: string): Promise<ClassReport> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`report ${res.status}`);
  return res.json();
}

function joinUrl(classId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base.replace(/\/$/, "")}/start?class=${encodeURIComponent(classId)}`;
}

/** Cells and rows that changed between two reports (for the flash). */
function diffReports(prev: ClassReport, next: ClassReport): Set<string> {
  const out = new Set<string>();
  const before = new Map(prev.students.map((s) => [s.student.id, s]));
  for (const s of next.students) {
    const old = before.get(s.student.id);
    if (!old) {
      out.add(`row:${s.student.id}`);
      continue;
    }
    for (const [skillId, st] of Object.entries(s.snapshot?.skills ?? {})) {
      const o = old.snapshot?.skills[skillId];
      if (!o || levelOf(o) !== levelOf(st) || o.attempts !== st.attempts) out.add(`${s.student.id}:${skillId}`);
    }
  }
  return out;
}

export function TeacherDashboard({ initial, backHref }: { initial: ClassReport; backHref?: string }) {
  const classId = initial.classRoom.id;
  const lastOk = useRef(0);
  const { data, mutate } = useSWR<ClassReport>(
    `/api/teacher/report?classId=${encodeURIComponent(classId)}`,
    fetchReport,
    {
      fallbackData: initial,
      refreshInterval: POLL_MS,
      revalidateOnFocus: true,
      keepPreviousData: true,
      onSuccess: () => {
        lastOk.current = Date.now();
      },
    },
  );
  const report = data ?? initial;

  // Live / stale badge.
  const [stale, setStale] = useState(false);
  useEffect(() => {
    lastOk.current = Date.now();
    const t = setInterval(() => setStale(Date.now() - lastOk.current > STALE_MS), 1000);
    return () => clearInterval(t);
  }, []);
  const showStale = stale;

  // Flash what changed since the previous poll.
  const prevRef = useRef<ClassReport | null>(null);
  const [diff, setDiff] = useState<{ changed: Set<string>; version: number }>({ changed: new Set(), version: 0 });
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = report;
    if (!prev || prev.generatedAt === report.generatedAt) return;
    const changed = diffReports(prev, report);
    if (changed.size) setDiff((d) => ({ changed, version: d.version + 1 }));
  }, [report]);

  const groups = useMemo(() => groupStudents(report), [report]);
  const [joinOpen, setJoinOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function resetDemo() {
    setResetting(true);
    try {
      const res = await fetch("/api/teacher/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ classId }),
      });
      if (!res.ok) throw new Error(String(res.status));
      prevRef.current = null;
      await mutate();
      setResetOpen(false);
      toast.success("Demo holati tiklandi");
    } catch {
      toast.error("Tiklab bölmadi. Aloqani tekşirib, qayta urinib köring.");
    } finally {
      setResetting(false);
    }
  }

  const empty = report.students.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-4 px-5 py-4 lg:h-dvh lg:px-8">
      <header className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {backHref ? (
          <Link
            href={backHref}
            className="border-ink hover:bg-ink-wash flex h-10 items-center gap-1.5 rounded-[14px] border-2 px-3 text-sm font-semibold"
          >
            <ArrowLeft className="size-4" aria-hidden /> Sinf
          </Link>
        ) : (
          <Logo size={34} />
        )}
        <span className="bg-border hidden h-8 w-px sm:block" aria-hidden />
        <div className="min-w-0">
          <h1 className="text-[1.45rem] leading-tight font-bold">{normalizeUz(report.classRoom.name)}</h1>
          <p className="text-ink-soft text-sm">
            {normalizeUz(report.classRoom.teacherName)} · Matematika, «Kasrlar»
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <LiveBadge stale={showStale} />
          <Button
            variant="outline"
            className="h-10 rounded-[14px] border-2 border-ink px-4 text-sm font-semibold"
            onClick={() => setJoinOpen(true)}
          >
            <QrCode aria-hidden />
            Öquvçini ulaş
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-lg" className="size-10 rounded-[14px]" aria-label="Qöşimça amallar">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuItem onSelect={() => setResetOpen(true)}>
                <RotateCcw aria-hidden />
                Demo holatini tiklaş
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <KpiTiles report={report} />

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_430px]">
        {empty ? (
          <EmptyClass url={joinUrl(classId)} />
        ) : (
          <Heatmap report={report} groups={groups} changed={diff.changed} version={diff.version} />
        )}

        <div className="flex min-h-0 flex-col gap-4">
          <RootGaps report={report} />
          <Tabs defaultValue="feed" className="sheet flex min-h-[160px] flex-1 flex-col gap-0 overflow-hidden">
            <div className="px-5 pt-3.5">
              <TabsList className="w-full">
                <TabsTrigger value="feed" className="text-sm font-semibold">
                  Jonli faollik
                </TabsTrigger>
                <TabsTrigger value="mis" className="text-sm font-semibold">
                  Xato turlari
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="feed" className="min-h-0 flex-1 overflow-y-auto px-4 pt-2 pb-3">
              <ActivityFeed report={report} />
            </TabsContent>
            <TabsContent value="mis" className="min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-3">
              <Misconceptions report={report} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Telefoningiz bilan skanerlang</DialogTitle>
            <DialogDescription>
              Öquvçi ismini yozadi va diagnostikani boşlaydi. Natijasi şu panelda darhol paydo böladi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid place-items-center py-2">
            <div className="rounded-2xl border-2 border-ink bg-white p-4">
              {joinOpen && <QRCodeSVG value={joinUrl(classId)} size={240} fgColor="#1d2b64" level="M" />}
            </div>
            {joinOpen && (
              <p className="text-ink-soft mt-3 text-center text-sm font-medium break-all">{joinUrl(classId)}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={(o) => !resetting && setResetOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Demo holatini tiklaysizmi?</DialogTitle>
            <DialogDescription>
              Sinf 24 ta namunaviy öquvçiga qaytariladi. Demo paytida qöşilgan öquvçilar va ularning javoblari
              öçiriladi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="h-10 rounded-[14px] px-4" disabled={resetting}>
                Bekor qiliş
              </Button>
            </DialogClose>
            <Button className="h-10 rounded-[14px] px-4" onClick={resetDemo} disabled={resetting}>
              {resetting ? <Loader2 className="animate-spin" aria-hidden /> : <RotateCcw aria-hidden />}
              {resetting ? "Tiklanmoqda…" : "Ha, tiklaş"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyClass({ url }: { url: string }) {
  return (
    <section className="sheet grid place-items-center p-8 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <h2 className="text-2xl font-bold">Sinf hali böş</h2>
        <p className="text-ink-soft text-[1.05rem]">
          Öquvçilar QR kodni skanerlab, ismini yozib, diagnostikani boşlaşsin. Har bir javob şu yerda jonli
          körinadi.
        </p>
        <div className="rounded-2xl border-2 border-ink bg-white p-4">
          <QRCodeSVG value={url} size={200} fgColor="#1d2b64" level="M" />
        </div>
        <p className="text-ink-soft text-sm font-medium break-all">{url}</p>
      </div>
    </section>
  );
}
