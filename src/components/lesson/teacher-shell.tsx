"use client";

import { BookOpen, Check, ChevronDown, LayoutDashboard, LogOut, School, Settings2, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ClassGroup } from "@/lib/types";
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
  { href: "/teacher/classes", label: "Sinflar", icon: School },
  { href: "/teacher/subjects", label: "Fanlar", icon: BookOpen },
  { href: "/teacher/accounts", label: "Hisoblar", icon: Users },
];

/** Fired by the classes page after create/rename/delete so the header switcher reloads. */
export const CLASSES_CHANGED = "ildiz:classes-changed";

/** Header dropdown: the teacher's active class, switch to another one, or manage classes. */
function ClassSwitcher() {
  const router = useRouter();
  const [data, setData] = useState<{ activeId?: string; classes: ClassGroup[] }>({ classes: [] });
  const load = useCallback(() => {
    fetch("/api/classes")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d))
      .catch(() => {});
  }, []);
  useEffect(() => {
    load();
    window.addEventListener(CLASSES_CHANGED, load);
    return () => window.removeEventListener(CLASSES_CHANGED, load);
  }, [load]);

  const active = data.classes.find((c) => c.id === data.activeId);
  async function pick(c: ClassGroup) {
    if (c.id === data.activeId) return;
    const res = await fetch(`/api/classes/${c.id}/activate`, { method: "POST" }).catch(() => null);
    if (!res?.ok) return void toast.error("Sinf tanlanmadi, qayta urinib köring");
    setData((d) => ({ ...d, activeId: c.id }));
    toast.success(`“${c.name}” tanlandi`);
    window.dispatchEvent(new Event(CLASSES_CHANGED));
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Sinfni tanlaş"
        className="flex h-9 max-w-48 items-center gap-1.5 rounded-xl border-2 border-white/30 px-3 text-sm font-semibold transition hover:bg-white/10"
      >
        <School className="size-4 shrink-0" />
        <span className="truncate">{active?.name ?? "Sinf"}</span>
        <ChevronDown className="size-4 shrink-0 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>Sinflar</DropdownMenuLabel>
        {data.classes.map((c) => (
          <DropdownMenuItem key={c.id} onSelect={() => void pick(c)}>
            {c.id === data.activeId ? <Check className="size-4" /> : <span className="size-4" />}
            <span className="truncate">{c.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/teacher/classes">
            <Settings2 className="size-4" /> Sinflarni boşqariş
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
          <ClassSwitcher />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-muted-foreground text-xs">Öqituvçi</p>
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
