"use client";

import { SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MathText } from "@/components/brand/math-text";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import type { Question, SkillId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { safePartial } from "./tutor-panel";
import { useTextStream } from "./use-text-stream";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = ["Nega shunday?", "Boshqa misol bilan tushuntir", "Qayerda adashdim?"];

/** Bottom drawer chat with the tutor about the current skill/question. */
export function TutorChat({
  open,
  onOpenChange,
  skillId,
  question,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  skillId: SkillId;
  question?: Question;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const stream = useTextStream();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [msgs, stream.text]);

  function send(text: string) {
    const content = text.trim();
    if (!content || stream.loading) return;
    const history: Msg[] = [...msgs, { role: "user", content }];
    setMsgs(history);
    setInput("");
    const apiMessages = history.slice(-10);
    void stream.start("/api/tutor/chat", { skillId, question, messages: apiMessages }, (full) => {
      setMsgs((m) => [...m, { role: "assistant", content: full }]);
      stream.setText("");
    });
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-h-[88dvh] max-w-xl">
        <DrawerHeader className="text-left">
          <DrawerTitle className="font-display">Ustozdan soʻra</DrawerTitle>
          <DrawerDescription>Savolingni yoz — ustoz javobni aytib qoʻymaydi, oʻylashga yordam beradi.</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-2">
          {msgs.length === 0 && !stream.loading && (
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="bg-ink-wash hover:bg-ink hover:text-white rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {msgs.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5",
                m.role === "user" ? "bg-ink ml-auto text-white" : "sheet rounded-2xl",
              )}
            >
              <MathText text={m.content} className="text-[0.98rem] leading-relaxed" />
            </div>
          ))}
          {stream.loading && (
            <div className="sheet max-w-[85%] rounded-2xl px-4 py-2.5">
              {stream.text ? (
                <MathText text={safePartial(stream.text)} className="text-[0.98rem] leading-relaxed" />
              ) : (
                <span className="text-muted-foreground text-sm">Ustoz oʻylayapti…</span>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2 border-t p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Savolingni yoz…"
            maxLength={500}
            className="border-input focus-visible:border-ink h-12 flex-1 rounded-xl border-2 bg-card px-3 outline-none"
          />
          <Button type="submit" size="icon" className="size-12 rounded-xl" disabled={!input.trim() || stream.loading} aria-label="Yuborish">
            <SendHorizontal />
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
