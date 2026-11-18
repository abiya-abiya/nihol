"use client";

import { Copy, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** The organization creates a teacher's login and password. */
export function NewTeacher() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [made, setMade] = useState<{ name: string; login: string; password: string } | null>(null);

  async function create() {
    setBusy(true);
    const res = await fetch("/api/org/teachers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = await res.json();
    setBusy(false);
    if (!res.ok) return void toast.error(body.error ?? "Hisob yaratilmadi");
    setMade(body.teacher);
    setName("");
    router.refresh();
  }

  async function copy() {
    if (!made) return;
    const text = `Nihol: login ${made.login}, parol ${made.password}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Nusxa olindi");
    } catch {
      toast(text);
    }
  }

  return (
    <div className="sheet space-y-3 p-5">
      <h2 className="text-lg font-bold">Yangi öqituvçi</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length >= 3) void create();
        }}
        className="flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ism va familiya"
          className="border-input focus-visible:border-ink h-11 min-w-0 flex-1 rounded-xl border-2 bg-card px-3 outline-none"
        />
        <Button type="submit" disabled={busy || name.trim().length < 3} className="h-11 rounded-xl">
          <UserPlus className="size-4" /> Yaratiş
        </Button>
      </form>
      {made && (
        <div className="bg-mastered/10 flex flex-wrap items-center gap-3 rounded-xl p-3">
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">{made.name}</p>
            <p>
              Login: <span className="font-mono font-semibold">{made.login}</span> · Parol:{" "}
              <span className="font-mono font-semibold">{made.password}</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={copy} className="h-9 rounded-xl">
            <Copy className="size-4" /> Nusxa
          </Button>
        </div>
      )}
      <p className="text-muted-foreground text-xs">Öqituvçi şu login bilan kiradi; unga bitta böş sinf ham oçiladi.</p>
    </div>
  );
}
