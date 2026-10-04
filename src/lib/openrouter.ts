import "server-only";
import { z } from "zod";
export async function modelJSON<T>(
  system: string,
  user: string,
  schema: z.ZodType<T>,
  maxTokens = 2200,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<T> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OpenRouter is not configured.");
  let repair = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "THIRD WHEEL",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "openrouter/free",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user + repair },
          ],
          response_format: { type: "json_object" },
          temperature: 0.65,
          max_tokens: maxTokens,
        }),
        signal: options.signal
          ? AbortSignal.any([
              options.signal,
              AbortSignal.timeout(options.timeoutMs || 15000),
            ])
          : AbortSignal.timeout(options.timeoutMs || 15000),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Model provider returned ${res.status}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== "string") throw new Error("Empty model response");
      return schema.parse(
        JSON.parse(
          content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, ""),
        ),
      );
    } catch (error) {
      if (options.signal?.aborted) throw error;
      if (attempt === 1) throw error;
      repair =
        "\nYour last response was invalid. Return a complete JSON object matching the supplied schema. No markdown.";
    }
  }
  throw new Error("Invalid model response");
}
