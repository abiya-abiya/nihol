"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { FadeIn } from "@/components/brand/motion";
import { Button } from "@/components/ui/button";
import { clearLocal, createStudent, getLocalStudent, loadSnapshot } from "@/lib/student-store";
import type { Student } from "@/lib/types";

const CLASS_NAMES: Record<string, string> = { "6a": "6-A sinf" };
const className = (id: string) => CLASS_NAMES[id] ?? `${id.toUpperCase()} sinf`;

function StartForm() {
  const router = useRouter();
  const params = useSearchParams();
  const classId = (params.get("class") || process.env.NEXT_PUBLIC_DEMO_CLASS_ID || "6a").toLowerCase();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState<{ student: Student; done: boolean } | null>(null);

  useEffect(() => {
    const student = getLocalStudent();
    if (student) setExisting({ student, done: !!loadSnapshot()?.diagnosticDone });
    // Warm the whole student flow while we are surely online.
    for (const r of ["/diagnostic", "/result", "/path"]) router.prefetch(r);
  }, [router]);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    clearLocal();
    await createStudent(trimmed, classId);
    router.push("/diagnostic");
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-8 py-8">
      <FadeIn className="space-y-5">
        <LogoMark size={56} />
        <h1 className="text-[2.1rem] leading-[1.12] font-bold sm:text-5xl">Bilimingni niholdek östiramiz</h1>
        <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
          Kasrlar böyiça bir neça savolga javob ber. Keyin qayerdan boşlaş kerakligini aniq körsatamiz.
        </p>
      </FadeIn>

      {existing && (
        <FadeIn delay={0.1} className="sheet flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate font-semibold">{existing.student.name}</p>
            <p className="text-muted-foreground text-sm">{existing.done ? "Xaritang tayyor" : "Diagnostika tugamagan"}</p>
          </div>
          <Button asChild size="lg" className="h-11 rounded-xl px-4">
            <Link href={existing.done ? "/path" : "/diagnostic"}>
              Davom etiş <ArrowRight />
            </Link>
          </Button>
        </FadeIn>
      )}

      <FadeIn delay={0.15}>
        <form onSubmit={start} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold">{existing ? "Yoki yangi ism bilan boşla" : "Isming"}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan, Jasur"
              autoComplete="given-name"
              maxLength={40}
              className="border-input focus-visible:border-ink h-14 w-full rounded-2xl border-2 bg-card px-4 text-lg outline-none placeholder:text-ink-soft/60"
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            <span className="bg-ink-wash text-ink rounded-full px-3 py-1.5 text-sm font-semibold">{className(classId)}</span>
            <span className="font-hand text-red-pen -rotate-2 text-xl">≈ 5 daqiqa</span>
          </div>
          <Button type="submit" disabled={!name.trim() || busy} className="h-14 w-full rounded-2xl text-lg font-semibold">
            {busy ? "Tayyorlanmoqda…" : "Boşlaş"}
            {!busy && <ArrowRight className="size-5" />}
          </Button>
          {existing && (
            <button
              type="button"
              onClick={() => {
                clearLocal();
                setExisting(null);
              }}
              className="text-muted-foreground mx-auto flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
            >
              <RotateCcw className="size-3.5" /> Bu qurilmadagi natijani öçiriş
            </button>
          )}
        </form>
      </FadeIn>
    </div>
  );
}

export default function StartPage() {
  return (
    <Suspense>
      <StartForm />
    </Suspense>
  );
}
