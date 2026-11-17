import "server-only";
import { z } from "zod";

// Gemini over plain REST (no SDK): we need exact control over status codes
// to fail over between keys and models.
const API = "https://generativelanguage.googleapis.com/v1beta/models";

/** Models in failover order. The first one that answers wins. */
export const MODELS = (process.env.GEMINI_MODELS || "gemini-flash-latest,gemini-3.5-flash-lite,gemini-flash-lite-latest")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Keys in failover order: GEMINI_API_KEYS="key1,key2". */
function apiKeys(): string[] {
  return (process.env.GEMINI_API_KEYS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Live AI only when a key is present and AI_MODE is not "fallback". */
export function aiEnabled(): boolean {
  return process.env.AI_MODE !== "fallback" && apiKeys().length > 0;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface GeminiRequest {
  system: string;
  messages: ChatMessage[];
  maxTokens: number;
  /** JSON Schema for structured output. */
  jsonSchema?: object;
}

interface Budget {
  /** Give up on one key/model attempt if no response headers arrive in time. */
  attemptMs: number;
  /** Give up on the whole chain after this long. */
  totalMs: number;
}

function requestBody(req: GeminiRequest): string {
  return JSON.stringify({
    systemInstruction: { parts: [{ text: req.system }] },
    contents: req.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    generationConfig: {
      maxOutputTokens: req.maxTokens,
      thinkingConfig: { thinkingLevel: "low" },
      ...(req.jsonSchema ? { responseMimeType: "application/json", responseJsonSchema: req.jsonSchema } : {}),
    },
  });
}

/**
 * POST to Gemini with failover across keys and models (MODELS order, then key order).
 * - 429 or other 5xx: the same model with the next key.
 * - 401/403 (bad key): that key is skipped for every model.
 * - 503 (overloaded), 400, timeout or network error: the next model first; if time is left after
 *   every other option, its untried keys get one more go.
 * Returns the first OK response with its body unread; throws when nothing is left.
 */
async function geminiFetch(method: "generateContent" | "streamGenerateContent", req: GeminiRequest, budget: Budget): Promise<Response> {
  const keys = apiKeys();
  const deadline = Date.now() + budget.totalMs;
  const body = requestBody(req);
  const query = method === "streamGenerateContent" ? "?alt=sse" : "";
  const badKeys = new Set<number>();
  const badModels = new Set<string>();
  const tried = new Set<string>();
  const next = (): [string, number] | null => {
    for (const allowBad of [false, true])
      for (const model of MODELS) {
        if (!allowBad && badModels.has(model)) continue;
        for (let k = 0; k < keys.length; k++) if (!badKeys.has(k) && !tried.has(`${model}#${k}`)) return [model, k];
      }
    return null;
  };

  for (let pick = next(); pick; pick = next()) {
    const [model, k] = pick;
    tried.add(`${model}#${k}`);
    const left = deadline - Date.now();
    if (left <= 500) throw new Error("gemini: time budget used up");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), Math.min(budget.attemptMs, left));
    const tag = `[ai] ${model} key#${k + 1}`;
    const started = Date.now();
    try {
      const res = await fetch(`${API}/${model}:${method}${query}`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": keys[k] },
        body,
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        console.info(`${tag} -> OK in ${Date.now() - started} ms`);
        // Headers are in; still cap how long the body may take.
        setTimeout(() => ctrl.abort(), 45_000);
        return res;
      }
      console.warn(`${tag} -> HTTP ${res.status}`);
      void res.body?.cancel();
      if (res.status === 401 || res.status === 403) badKeys.add(k);
      else if (res.status === 400 || res.status === 503) badModels.add(model);
    } catch (err) {
      clearTimeout(timer);
      console.warn(`${tag} -> ${ctrl.signal.aborted ? "timeout" : err instanceof Error ? err.message : err} after ${Date.now() - started} ms`);
      badModels.add(model);
    }
  }
  throw new Error("gemini: every key and model failed");
}

type Part = { text?: string; thought?: boolean };
type Chunk = { candidates?: Array<{ content?: { parts?: Part[] } }> };

function chunkText(chunk: Chunk): string {
  return (chunk.candidates?.[0]?.content?.parts ?? [])
    .filter((p) => !p.thought && p.text)
    .map((p) => p.text)
    .join("");
}

/** Text pieces from a Gemini `?alt=sse` stream. */
async function* sseText(res: Response): AsyncGenerator<string> {
  if (!res.body) return;
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const text = chunkText(JSON.parse(line.slice(5)) as Chunk);
      if (text) yield text;
    }
  }
}

/** Wrap an async text iterator as a streamed text/plain response. */
export function streamText(chunks: AsyncIterable<string>): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const c of chunks) controller.enqueue(encoder.encode(c));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" },
  });
}

/** Emit `text` in small pieces so fallback text still "types" on screen. */
export async function* typeOut(text: string): AsyncGenerator<string> {
  for (const word of text.split(/(?<=\s)/)) {
    yield word;
    await new Promise((r) => setTimeout(r, 18));
  }
}

interface StreamArgs {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  firstTokenTimeoutMs?: number;
}

/**
 * Stream Gemini's text; if every key and model is unavailable, slow to start,
 * or returns nothing (e.g. a safety block), stream `fallback` instead. Never throws.
 */
export async function* tutorStream(args: StreamArgs, fallback: string): AsyncGenerator<string> {
  let emitted = false;
  if (aiEnabled()) {
    try {
      const res = await geminiFetch(
        "streamGenerateContent",
        { system: args.system, messages: args.messages, maxTokens: args.maxTokens ?? 1024 },
        { attemptMs: args.firstTokenTimeoutMs ?? 6000, totalMs: 20_000 },
      );
      for await (const text of sseText(res)) {
        emitted = true;
        yield text;
      }
    } catch (err) {
      console.error("[ai] tutor stream failed:", err instanceof Error ? err.message : err);
    }
  }
  if (!emitted) yield* typeOut(fallback);
}

/** Structured output validated by `schema`; null when the AI is off or fails. */
export async function generateJson<T>(
  schema: z.ZodType<T>,
  args: { system: string; user: string; maxTokens: number; timeoutMs: number },
): Promise<T | null> {
  if (!aiEnabled()) return null;
  try {
    const { $schema: _drop, ...jsonSchema } = z.toJSONSchema(schema) as Record<string, unknown>;
    const res = await geminiFetch(
      "generateContent",
      { system: args.system, messages: [{ role: "user", content: args.user }], maxTokens: args.maxTokens, jsonSchema },
      { attemptMs: Math.min(args.timeoutMs, 10_000), totalMs: args.timeoutMs },
    );
    const parsed = schema.safeParse(JSON.parse(chunkText((await res.json()) as Chunk)));
    if (parsed.success) return parsed.data;
    console.error("[ai] structured output did not match the schema");
  } catch (err) {
    console.error("[ai] structured output failed:", err instanceof Error ? err.message : err);
  }
  return null;
}
