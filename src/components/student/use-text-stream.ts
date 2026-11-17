"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** POST JSON and accumulate a streamed text/plain response. */
export function useTextStream() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const ctrl = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    ctrl.current?.abort();
    ctrl.current = null;
  }, []);

  const start = useCallback(
    async (url: string, body: unknown, onDone?: (full: string) => void) => {
      stop();
      const c = new AbortController();
      ctrl.current = c;
      setText("");
      setError(false);
      setLoading(true);
      let full = "";
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
          signal: c.signal,
        });
        if (!res.ok || !res.body) throw new Error(String(res.status));
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          full += dec.decode(value, { stream: true });
          setText(full);
        }
        onDone?.(full);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError(true);
      } finally {
        if (ctrl.current === c) {
          setLoading(false);
          ctrl.current = null;
        }
      }
    },
    [stop],
  );

  useEffect(() => stop, [stop]);
  return { text, loading, error, start, stop, setText };
}
