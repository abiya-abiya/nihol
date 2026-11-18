"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { SUBJECT_ICON_NAMES, SubjectIcon } from "@/components/brand/subject-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const COLORS = ["#0f766e", "#b45309", "#4338ca", "#be123c", "#0369a1", "#7c2d12"];

/** "Yangi fan" — teacher creates a subject; lessons are added on its page. */
export function NewSubjectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState("flask-conical");
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, description, color, icon }),
    });
    const body = await res.json();
    setBusy(false);
    if (!res.ok) return toast.error(body.error ?? "Fan yaratilmadi");
    toast.success(`“${name}” fani yaratildi`, { description: "Endi unga darslar qöşing." });
    setOpen(false);
    router.push(`/teacher/subjects/${body.subject.id}`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-xl">
          <Plus className="size-4" /> Yangi fan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Yangi fan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <SubjectIcon icon={icon} color={color} size={52} />
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan, Kimyo"
              className="border-input focus-visible:border-ink h-12 flex-1 rounded-xl border-2 bg-card px-3 text-lg outline-none"
            />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Qisqa tavsif (ixtiyoriy)"
            rows={2}
            className="border-input focus-visible:border-ink w-full rounded-xl border-2 bg-card px-3 py-2 outline-none"
          />
          <div className="flex flex-wrap gap-2" aria-label="Rang">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={c}
                className={cn("size-8 rounded-full ring-offset-2 transition", color === c && "ring-ink ring-2")}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Belgi">
            {SUBJECT_ICON_NAMES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setIcon(n)}
                className={cn("rounded-2xl p-0.5 transition", icon === n ? "ring-ink ring-2" : "opacity-60 hover:opacity-100")}
              >
                <SubjectIcon icon={n} color={color} size={34} />
              </button>
            ))}
          </div>
          <Button onClick={create} disabled={busy || name.trim().length < 2} className="h-12 w-full rounded-xl text-base">
            Fanni yaratiş
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
