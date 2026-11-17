import type { ReactNode } from "react";
import { Backdrop } from "@/components/brand/backdrop";

export default function BolakLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <Backdrop variant="bolak" />
      {children}
    </div>
  );
}
