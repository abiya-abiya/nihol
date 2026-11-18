"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clearLocal, getLocalStudent, loadSnapshot, saveLocalStudent } from "@/lib/student-store";

/** Opens the v1 math diagnostic as the logged-in student. */
export function MathEntry({ studentId, name, classId }: { studentId: string; name: string; classId: string }) {
  const router = useRouter();
  function go() {
    const local = getLocalStudent();
    if (local?.id !== studentId) {
      clearLocal();
      saveLocalStudent({ id: studentId, name: name.split(" ")[0], classId, createdAt: new Date().toISOString() });
    }
    router.push(loadSnapshot()?.diagnosticDone && local?.id === studentId ? "/path" : "/diagnostic");
  }
  return (
    <Button onClick={go} className="h-10 rounded-xl">
      <Sparkles className="size-4" /> Diagnostika va SI-ustoz
    </Button>
  );
}
