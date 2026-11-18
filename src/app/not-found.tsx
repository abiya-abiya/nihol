import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <LogoMark size={56} />
      <h1 className="text-3xl font-bold">Bu sahifa topilmadi</h1>
      <p className="text-muted-foreground">Havola eskirgan bölişi mumkin. Boşidan boşlaymiz.</p>
      <Button asChild className="h-12 rounded-2xl px-6">
        <Link href="/start">Boşlaş sahifasiga</Link>
      </Button>
    </main>
  );
}
