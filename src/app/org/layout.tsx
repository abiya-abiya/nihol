import type { ReactNode } from "react";
import { Backdrop } from "@/components/brand/backdrop";
import { UserBar } from "@/components/brand/user-bar";
import { requireRole } from "@/lib/auth";

export default async function OrgArea({ children }: { children: ReactNode }) {
  const s = await requireRole("org");
  return (
    <div className="flex flex-1 flex-col">
      <Backdrop variant="bolak" />
      <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col overflow-x-clip px-4 pb-12 sm:px-8">
        <UserBar name={s.name} role="Taşkilot" home="/org" />
        {children}
      </div>
    </div>
  );
}
