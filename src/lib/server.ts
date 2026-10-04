import "server-only";
import type { NextRequest } from "next/server";
const buckets = new Map<string, { count: number; reset: number }>();
export function guard(
  request: NextRequest,
  kind: string,
  limit: number,
  accessCode?: string,
) {
  const origin = request.headers.get("origin");
  // Next's internal URL can use 0.0.0.0 while the browser uses localhost.
  // The Host header represents the destination the browser actually requested.
  const host = request.headers.get("host");
  const publicOrigin = host
    ? `${request.nextUrl.protocol}//${host}`
    : request.nextUrl.origin;
  if (
    origin &&
    origin !== publicOrigin &&
    origin !== process.env.NEXT_PUBLIC_APP_URL
  )
    throw new Error("Cross-site requests are not allowed.");
  const secret = process.env.LAB_ACCESS_CODE;
  if (secret && accessCode !== secret)
    throw new Error("Enter the Lab access code to use live APIs.");
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const key = `${kind}:${ip}`;
  const now = Date.now();
  if (buckets.size > 1000)
    for (const [key, b] of buckets) if (b.reset < now) buckets.delete(key);
  const bucket = buckets.get(key);
  if (bucket && bucket.reset > now) {
    if (bucket.count >= limit)
      throw new Error(
        "Too many requests. Give your agent a minute, then retry.",
      );
    bucket.count++;
  } else buckets.set(key, { count: 1, reset: now + 60000 });
}
export async function limitedJSON(request: NextRequest, max = 180000) {
  const text = await request.text();
  if (text.length > max) throw new Error("Request is too large.");
  return JSON.parse(text);
}
export function eventResponse(
  work: (send: (event: unknown) => void) => Promise<void>,
  signal: AbortSignal,
) {
  const encoder = new TextEncoder();
  let closed = false;
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: unknown) => {
        if (!closed && !signal.aborted)
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
            );
          } catch {
            closed = true;
          }
      };
      work(send)
        .catch((error) =>
          send({
            type: "error",
            text:
              error instanceof Error
                ? error.message
                : "Something went wrong. Please retry.",
          }),
        )
        .finally(() => {
          if (!closed) {
            closed = true;
            try {
              controller.close();
            } catch {}
          }
        });
    },
    cancel() {
      closed = true;
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
}
