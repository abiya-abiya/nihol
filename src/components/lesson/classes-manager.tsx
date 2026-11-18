"use client";

import { ArrowRight, Check, Pencil, Plus, School, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FadeIn, Stagger, StaggerItem } from "@/components/brand/motion";
import { CLASSES_CHANGED } from "@/components/lesson/teacher-shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ClassGroup } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ClassRow = ClassGroup & { students: number; parents: number; tests: number };

const DEMO_ID = "6a";
const GRADES = [5, 6, 7, 8, 9, 10, 11];
const gradeFromName = (name: string) => {
  const g = Number(name.match(/\d+/)?.[0]);
  return g >= 1 && g <= 11 ? g : null;
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "content-type": "application/json" }, ...init }).catch(() => null);
  const body = res ? await res.json().catch(() => ({})) : {};
  if (!res?.ok) throw new Error(body.error ?? "Internet yöq yoki server javob bermadi");
  return body as T;
}

/** /teacher/classes — create, rename, choose and delete classes. */
export function ClassesManager({ initial, activeId: initialActive }: { initial: ClassRow[]; activeId?: string }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [activeId, setActiveId] = useState(initialActive);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirm, setConfirm] = useState<ClassRow | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  // The header switcher refreshes the page: follow the server's rows and active class.
  useEffect(() => setRows(initial), [initial]);
  useEffect(() => setActiveId(initialActive), [initialActive]);

  const changed = () => {
    window.dispatchEvent(new Event(CLASSES_CHANGED));
    router.refresh();
  };
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    void run(async () => {
      const g = grade ? Number(grade) : gradeFromName(n);
      const { class: c } = await api<{ class: ClassRow }>("/api/classes", { method: "POST", body: JSON.stringify({ name: n, grade: g }) });
      setRows((r) => [...r, c]);
      setName("");
      setGrade("");
      setFreshId(c.id);
      toast.success(`“${c.name}” yaratildi`, { description: "Uni tanlang va Hisoblar sahifasida öquvçi qöşing." });
      changed();
    });
  };

  const activate = (c: ClassRow, then?: string) =>
    run(async () => {
      await api(`/api/classes/${c.id}/activate`, { method: "POST" });
      setActiveId(c.id);
      toast.success(`“${c.name}” tanlandi`);
      changed();
      if (then) router.push(then);
    });

  const rename = (c: ClassRow) => {
    const n = draft.trim();
    if (!n || n === c.name) return setEditing(null);
    void run(async () => {
      const { class: u } = await api<{ class: ClassGroup }>(`/api/classes/${c.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: n, grade: gradeFromName(n) ?? c.grade ?? null }),
      });
      setRows((r) => r.map((x) => (x.id === c.id ? { ...x, ...u } : x)));
      setEditing(null);
      toast.success("Sinf nomi özgartirildi");
      changed();
    });
  };

  const remove = (c: ClassRow) =>
    run(async () => {
      const { activeId: next } = await api<{ activeId?: string }>(`/api/classes/${c.id}`, { method: "DELETE" });
      setRows((r) => r.filter((x) => x.id !== c.id));
      setActiveId(next);
      setConfirm(null);
      toast.success(`“${c.name}” öçirildi`);
      changed();
    });

  return (
    <div className="space-y-6 pt-2">
      <FadeIn className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sinflar</h1>
          <p className="text-muted-foreground">
            Sinf yarating, nomini özgartiring yoki öçiring. Tanlangan sinf panel, fanlar, testlar va hisoblarda işlatiladi.
          </p>
        </div>
        <p className="text-ink-soft flex items-center gap-2 text-sm font-semibold">
          <School className="size-4" /> {rows.length} ta sinf
        </p>
      </FadeIn>

      <FadeIn>
        <form onSubmit={create} className="sheet flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <label className="block flex-1 space-y-1.5">
            <span className="text-sm font-semibold">Yangi sinf nomi</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan, 6-B sinf"
              maxLength={40}
              className="border-input focus-visible:border-ink h-12 w-full rounded-xl border-2 bg-card px-3 text-base outline-none"
            />
          </label>
          <label className="block space-y-1.5 sm:w-36">
            <span className="text-sm font-semibold">Sinf darajasi</span>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="border-input focus-visible:border-ink h-12 w-full rounded-xl border-2 bg-card px-3 text-base outline-none"
            >
              <option value="">Avto</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}-sinf
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={busy || !name.trim()} className="h-12 rounded-xl px-6 text-base">
            <Plus className="size-4" /> Sinf yaratiş
          </Button>
        </form>
      </FadeIn>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
        {rows.map((c) => {
          const active = c.id === activeId;
          return (
            <StaggerItem key={c.id}>
              <div
                className={cn(
                  "sheet relative flex h-full flex-col gap-4 p-5",
                  active && "outline-highlight outline-3 outline-offset-2",
                  !active && c.id === freshId && "outline-mastered outline-2 outline-offset-2",
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="bg-ink font-display grid size-12 shrink-0 place-items-center rounded-2xl text-lg font-bold text-white">
                    {c.grade ?? <School className="size-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    {editing === c.id ? (
                      <form
                        className="flex items-center gap-1.5"
                        onSubmit={(e) => {
                          e.preventDefault();
                          rename(c);
                        }}
                      >
                        <input
                          autoFocus
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => e.key === "Escape" && setEditing(null)}
                          maxLength={40}
                          aria-label="Sinf nomi"
                          className="border-input focus-visible:border-ink h-10 min-w-0 flex-1 rounded-lg border-2 bg-card px-2 font-semibold outline-none"
                        />
                        <Button type="submit" size="icon" disabled={busy} aria-label="Saqlaş" className="size-10 rounded-lg">
                          <Check className="size-4" />
                        </Button>
                        <Button type="button" size="icon" variant="ghost" aria-label="Bekor qiliş" onClick={() => setEditing(null)}>
                          <X className="size-4" />
                        </Button>
                      </form>
                    ) : (
                      <p className="font-display truncate text-lg font-bold">{c.name}</p>
                    )}
                    <p className="text-muted-foreground text-sm">
                      {c.students} öquvçi · {c.parents} ota-ona · {c.tests} test
                    </p>
                  </div>
                  {active && <span className="bg-highlight text-ink shrink-0 rounded-full px-2.5 py-1 text-xs font-bold">Hozirgi</span>}
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  {active ? (
                    <Button asChild className="h-10 rounded-xl">
                      <Link href="/teacher">
                        Sinf paneli <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button onClick={() => activate(c)} disabled={busy} className="h-10 rounded-xl">
                        Tanlaş
                      </Button>
                      <Button variant="secondary" onClick={() => activate(c, "/teacher/accounts")} disabled={busy} className="h-10 rounded-xl">
                        Öquvçi qöşiş
                      </Button>
                    </>
                  )}
                  <div className="ml-auto flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${c.name}: nomini özgartiriş`}
                      title="Nomini özgartiriş"
                      onClick={() => {
                        setEditing(c.id);
                        setDraft(c.name);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${c.name}: öçiriş`}
                      title={c.id === DEMO_ID ? "Demo sinf öçirilmaydi" : "Sinfni öçiriş"}
                      disabled={c.id === DEMO_ID || busy}
                      onClick={() => setConfirm(c)}
                      className="text-red-pen hover:text-red-pen"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">“{confirm?.name}” öçirilsinmi?</DialogTitle>
            <DialogDescription>
              Sinf bilan birga undagi {confirm?.students ?? 0} öquvçi, {confirm?.parents ?? 0} ota-ona hisobi, {confirm?.tests ?? 0} test va
              natijalar ham öçiriladi. Buni qaytarib bölmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Bekor qiliş
            </Button>
            <Button variant="destructive" disabled={busy} onClick={() => confirm && remove(confirm)}>
              <Trash2 className="size-4" /> Ha, öçiriş
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
