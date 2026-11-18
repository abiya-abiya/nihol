import type { ReactNode } from "react";
import { Backdrop } from "@/components/brand/backdrop";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="theme-doska flex flex-1 flex-col">
      <Backdrop variant="doska" />
      {children}
    </div>
  );
}
