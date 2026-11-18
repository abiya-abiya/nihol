"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

/** Top bar for logged-in areas: logo, role label, name, logout. */
export function UserBar({ name, role, home }: { name: string; role: string; home: string }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  }
  return (
    <header className="flex items-center gap-3 py-3">
      <Link href={home} aria-label="Boş sahifa">
        <Logo size={30} />
      </Link>
      <div className="ml-auto flex min-w-0 items-center gap-3">
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-muted-foreground text-xs">{role}</p>
        </div>
        <Button variant="outline" size="sm" onClick={logout} className="h-9 rounded-xl">
          <LogOut className="size-4" /> Çiqiş
        </Button>
      </div>
    </header>
  );
}
