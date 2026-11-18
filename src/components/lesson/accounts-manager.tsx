"use client";

import { Check, Copy, KeyRound, UserPlus, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FadeIn, Stagger, StaggerItem } from "@/components/brand/motion";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

const loginUrl = () => (typeof window === "undefined" ? "/login" : `${window.location.origin}/login`);

function credText(users: User[]) {
  return [
    "Ildiz — kiriş",
    loginUrl(),
    ...users.map((u) => `${u.role === "parent" ? "Ota-ona" : "Öquvçi"}: ${u.name}\nLogin: ${u.login}\nParol: ${u.password}`),
  ].join("\n\n");
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Nusxalandi");
    return true;
  } catch {
    toast.error("Nusxalab bölmadi");
    return false;
  }
}

function CopyButton({ text, label = "Nusxalaş" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    if (await copyText(text)) {
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={label}
      className={cn(
        "border-input hover:border-ink flex size-9 shrink-0 items-center justify-center rounded-xl border-2 bg-card transition",
        done && "border-mastered text-mastered",
      )}
    >
      {done ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}

function Cred({ user }: { user: User }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <dl className="grid min-w-0 flex-1 grid-cols-[auto_1fr] gap-x-2 text-sm">
        <dt className="text-muted-foreground">Login</dt>
        <dd className="truncate font-mono font-semibold">{user.login}</dd>
        <dt className="text-muted-foreground">Parol</dt>
        <dd className="truncate font-mono font-semibold">{user.password}</dd>
      </dl>
      <CopyButton text={credText([user])} label={`${user.name}: login va parolni nusxalaş`} />
    </div>
  );
}

function Person({ user, tone }: { user: User; tone: "ink" | "wash" }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          tone === "ink" ? "bg-ink text-white" : "bg-ink-wash text-ink",
        )}
      >
        {user.name.charAt(0)}
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold">{user.name}</p>
        <p className="text-muted-foreground text-xs">{user.role === "parent" ? "Ota-ona" : "Öquvçi"}</p>
      </div>
    </div>
  );
}

/** /teacher/accounts — list class accounts and create a student (+ parent) with generated login/password. */
export function AccountsManager({ initial }: { initial: User[] }) {
  const [users, setUsers] = useState(initial);
  const [name, setName] = useState("");
  const [withParent, setWithParent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<User[] | null>(null);

  const rows = useMemo(
    () =>
      users
        .filter((u) => u.role === "student")
        .map((s) => ({ student: s, parent: users.find((u) => u.role === "parent" && u.childId === s.id) })),
    [users],
  );
  const parents = users.filter((u) => u.role === "parent").length;
  const freshId = created?.[0]?.id;

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return;
    setBusy(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim(), withParent }),
    }).catch(() => null);
    const body = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return toast.error(body.error ?? "Hisob yaratilmadi");
    const list = body.created as User[];
    setUsers((prev) => [...list, ...prev]);
    setCreated(list);
    setName("");
    toast.success(`${list[0].name} uçun hisob tayyor`, { description: "Login va parolni nusxalab bering." });
  }

  return (
    <div className="space-y-6 pt-2">
      <FadeIn className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hisoblar</h1>
          <p className="text-muted-foreground">
            6-A sinf öquvçilari va ota-onalari. Yangi hisob oçing, login va parolni nusxalab bering.
          </p>
        </div>
        <p className="text-ink-soft flex items-center gap-2 text-sm font-semibold">
          <Users className="size-4" /> {rows.length} öquvçi · {parents} ota-ona
        </p>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <FadeIn className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <form onSubmit={create} className="sheet space-y-4 p-5">
            <div className="flex items-center gap-3">
              <span className="bg-ink-wash text-ink flex size-11 items-center justify-center rounded-2xl">
                <UserPlus className="size-5" />
              </span>
              <h2 className="font-display text-lg font-bold">Yangi öquvçi</h2>
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">Ism va familiya</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan, Madina Rahimova"
                maxLength={60}
                className="border-input focus-visible:border-ink h-12 w-full rounded-xl border-2 bg-card px-3 text-base outline-none"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={withParent}
                onChange={(e) => setWithParent(e.target.checked)}
                className="accent-ink size-5"
              />
              Ota-ona uçun ham hisob oçiş
            </label>
            <Button type="submit" disabled={busy || name.trim().length < 2} className="h-12 w-full rounded-xl text-base">
              {busy ? "Yaratilmoqda…" : "Hisob yaratiş"}
            </Button>
          </form>

          <AnimatePresence mode="wait">
            {created && (
              <motion.div
                key={created[0].id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="sheet border-mastered space-y-4 border-2 p-5"
                role="status"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-mastered flex size-10 items-center justify-center rounded-full text-white">
                    <KeyRound className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold">Hisob tayyor</p>
                    <p className="text-muted-foreground truncate text-sm">Kiriş: {loginUrl().replace(/^https?:\/\//, "")}</p>
                  </div>
                </div>
                {created.map((u) => (
                  <div key={u.id} className="space-y-1">
                    <p className="text-sm font-semibold">
                      {u.role === "parent" ? "Ota-ona" : "Öquvçi"} · {u.name}
                    </p>
                    <Cred user={u} />
                  </div>
                ))}
                <Button variant="secondary" className="h-11 w-full rounded-xl" onClick={() => copyText(credText(created))}>
                  <Copy className="size-4" /> Hammasini nusxalaş
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </FadeIn>

        <section aria-label="Sinf hisoblari" className="min-w-0">
          {rows.length === 0 ? (
            <div className="sheet text-muted-foreground p-8 text-center">Sinfda hali öquvçi yöq. Formadan qöşing.</div>
          ) : (
            <Stagger className="space-y-3">
              {rows.map(({ student, parent }) => (
                <StaggerItem key={student.id}>
                  <div
                    className={cn(
                      "sheet grid gap-4 p-4 transition-shadow sm:grid-cols-2",
                      student.id === freshId && "outline-mastered outline-2 outline-offset-2",
                    )}
                  >
                    <div className="min-w-0 space-y-2">
                      <Person user={student} tone="ink" />
                      <Cred user={student} />
                    </div>
                    <div className="min-w-0 space-y-2 sm:border-l sm:border-dashed sm:pl-4">
                      {parent ? (
                        <>
                          <Person user={parent} tone="wash" />
                          <Cred user={parent} />
                        </>
                      ) : (
                        <p className="text-muted-foreground flex h-full items-center text-sm">Ota-ona hisobi yöq</p>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </section>
      </div>
    </div>
  );
}
