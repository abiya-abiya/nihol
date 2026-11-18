import type { ReactNode } from "react";
import { Backdrop } from "@/components/brand/backdrop";
import { UserBar } from "@/components/brand/user-bar";
import { requireRole } from "@/lib/auth";

export default async function StudentArea({ children }: { children: ReactNode }) {
  const s = await requireRole("student");
  return (
    <div className="flex flex-1 flex-col">
      <Backdrop variant="bolak" />
      <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-1 flex-col overflow-x-clip px-4 pb-12 sm:px-6">
        <UserBar name={s.name} role="Öquvçi · 6-A sinf" home="/student" />
        {children}
      </div>
    </div>
  );
}
