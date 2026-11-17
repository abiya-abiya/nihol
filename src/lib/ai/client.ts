import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

/** Live AI only when a key is present and AI_MODE is not "fallback". */
export function aiEnabled(): boolean {
  return process.env.AI_MODE !== "fallback" && !!process.env.ANTHROPIC_API_KEY;
}

let client: Anthropic | null = null;
export function getAnthropic(): Anthropic {
  client ??= new Anthropic({ maxRetries: 1, timeout: 30_000 });
  return client;
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
  messages: Anthropic.Beta.Messages.BetaMessageParam[];
  maxTokens?: number;
  firstTokenTimeoutMs?: number;
}

/**
 * Stream Claude's text; if the API is unavailable, slow to start, or refuses,
 * stream `fallback` instead. Never throws to the caller.
 */
export async function* tutorStream(args: StreamArgs, fallback: string): AsyncGenerator<string> {
  if (!aiEnabled()) {
    yield* typeOut(fallback);
    return;
  }
  let emitted = false;
  try {
    const stream = getAnthropic().beta.messages.stream({
      model: MODEL,
      max_tokens: args.maxTokens ?? 1024,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: args.system,
      messages: args.messages,
    });
    const timer = setTimeout(() => {
      if (!emitted) stream.abort();
    }, args.firstTokenTimeoutMs ?? 8000);
    try {
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          emitted = true;
          yield event.delta.text;
        }
      }
      const final = await stream.finalMessage();
      if (final.stop_reason === "refusal" && !emitted) yield* typeOut(fallback);
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    console.error("[ai] tutor stream failed:", err instanceof Error ? err.message : err);
    if (!emitted) yield* typeOut(fallback);
  }
}
