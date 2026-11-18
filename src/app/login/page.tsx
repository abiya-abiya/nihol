"use client";

import { ArrowRight, GraduationCap, HeartHandshake, Loader2, School } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { FadeIn, Stagger, StaggerItem } from "@/components/brand/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEMO = [
  { login: "ustoz", password: "ustoz123", role: "Öqituvçi", who: "Dilnoza Karimova", icon: School, tint: "#ffe45c" },
  { login: "jasur", password: "jasur123", role: "Öquvçi", who: "Jasur Toşmatov, 6-A", icon: GraduationCap, tint: "#7fd1a4" },
  { login: "ona", password: "ona123", role: "Ota-ona", who: "Jasurning onasi", icon: HeartHandshake, tint: "#ff8a7a" },
] as const;

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [welcome, setWelcome] = useState<string | null>(null);

  async function submit(l = login, p = password) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ login: l, password: p }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kiriş amalga oşmadi");
      setWelcome(data.user.name as string);
      window.setTimeout(() => router.push(data.home as string), 900);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-7 px-4 py-10">
      <AnimatePresence mode="wait">
        {welcome ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <LogoMark size={72} />
            <p className="font-hand text-highlight text-4xl -rotate-2">xuş kelibsiz!</p>
            <p className="font-display text-2xl font-bold">{welcome}</p>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0, y: -16 }} className="flex flex-col gap-7">
            <FadeIn className="space-y-4">
              <LogoMark size={56} />
              <h1 className="text-[2.2rem] leading-[1.1] font-bold">Ildizga kiriş</h1>
              <p className="text-muted-foreground text-lg">
                Öqituvçi, öquvçi va ota-ona bir platformada. {next ? "Davom etiş uçun hisobingizga kiring." : ""}
              </p>
            </FadeIn>

            <Stagger className="grid gap-2.5" gap={0.07} delay={0.1}>
              <p className="text-muted-foreground text-sm font-semibold">Demo hisoblar — bir bosişda kiriş</p>
              {DEMO.map((d) => (
                <StaggerItem key={d.login}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setLogin(d.login);
                      setPassword(d.password);
                      void submit(d.login, d.password);
                    }}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-2xl border-2 border-white/15 bg-white/5 p-3 text-left backdrop-blur-sm transition",
                      "hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10 disabled:opacity-60",
                    )}
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl text-[#1d2b64]" style={{ background: d.tint }}>
                      <d.icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{d.role}</span>
                      <span className="text-muted-foreground block truncate text-sm">
                        {d.who} · <span className="font-mono text-xs">{d.login}</span>
                      </span>
                    </span>
                    <ArrowRight className="size-5 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </button>
                </StaggerItem>
              ))}
            </Stagger>

            <FadeIn delay={0.3}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void submit();
                }}
                className="sheet space-y-3 p-5"
              >
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold">Login</span>
                  <input
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    autoComplete="username"
                    className="border-input focus-visible:border-ink h-12 w-full rounded-xl border-2 bg-card px-3 text-lg outline-none"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold">Parol</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="border-input focus-visible:border-ink h-12 w-full rounded-xl border-2 bg-card px-3 text-lg outline-none"
                  />
                </label>
                {error && (
                  <p role="alert" className="text-red-pen-strong text-sm font-semibold">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={busy || !login || !password} className="h-12 w-full rounded-xl text-base font-semibold">
                  {busy ? <Loader2 className="size-5 animate-spin" /> : "Kiriş"}
                </Button>
              </form>
            </FadeIn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
