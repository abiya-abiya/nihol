"use client";

import { useEffect } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <LogoMark size={56} />
      <h1 className="text-3xl font-bold">Nimadir ishlamadi</h1>
      <p className="text-muted-foreground">Natijalaring shu qurilmada saqlangan. Sahifani qayta yuklab koʻr.</p>
      <Button onClick={reset} className="h-12 rounded-2xl px-6">
        Qayta urinish
      </Button>
    </main>
  );
}
