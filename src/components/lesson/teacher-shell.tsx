"use client";

import { BookOpen, LayoutDashboard, LogOut, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Backdrop } from "@/components/brand/backdrop";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/** Chalkboard surface for every teacher page except the printable worksheet, which stays on paper. */
export function TeacherSurface({ children }: { children: ReactNode }) {
  const board = !usePathname().startsWith("/teacher/worksheet");
  return (
    <main className={cn("flex min-h-full flex-1 flex-col", board && "theme-doska")}>
      {board && <Backdrop variant="doska" formulas={false} />}
      {children}
    </main>
  );
}

const NAV = [
  { href: "/teacher", label: "Sinf", icon: LayoutDashboard },
  { href: "/teacher/subjects", label: "Fanlar", icon: BookOpen },
  { href: "/teacher/accounts", label: "Hisoblar", icon: Users },
];

/** Header + navigation for teacher pages. C may reuse it on /teacher. */
export function TeacherShell({ name, children, wide }: { name: string; children: ReactNode; wide?: boolean }) {
  const path = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  }
  return (
    <div className={cn("mx-auto flex w-full min-w-0 flex-1 flex-col px-4 pb-14 sm:px-8", wide ? "max-w-7xl" : "max-w-5xl")}>
      <header className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
        <Link href="/teacher" aria-label="Sinf">
          <Logo size={30} />
        </Link>
        <nav className="flex gap-1" aria-label="Öqituvçi menyusi">
          {NAV.map((n) => {
            const active = n.href === "/teacher" ? path === "/teacher" : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition",
                  active ? "bg-ink text-white" : "text-ink-soft hover:bg-ink-wash",
                )}
              >
                <n.icon className="size-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-muted-foreground text-xs">Öqituvçi · 6-A sinf</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="border-input hover:border-ink flex h-9 items-center gap-1.5 rounded-xl border-2 bg-card px-3 text-sm font-semibold"
          >
            <LogOut className="size-4" /> Çiqiş
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
