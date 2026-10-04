import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as analyze } from "../src/app/api/analyze/route";
import { POST as date } from "../src/app/api/date/live/route";
import data from "../src/data/demo.generated.json";
import { consumeEvents } from "../src/lib/stream";
let ip = 0;
function request(
  path: string,
  body: unknown,
  origin = "http://localhost:3000",
) {
  return new NextRequest(`http://0.0.0.0:3000${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      host: "localhost:3000",
      origin,
      "x-forwarded-for": `test-${ip++}`,
    },
    body: JSON.stringify(body),
  });
}
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("server boundaries and streamed lifecycle", () => {
  it("rejects cross-site requests before provider access", async () => {
    const res = await analyze(
      request(
        "/api/analyze",
        {
          linkedinUrl: "https://linkedin.com/in/ada",
          instagramUrl: "https://instagram.com/ada",
          consent: true,
        },
        "https://attacker.test",
      ),
    );
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("Cross-site");
  });
  it("validates links before spending", async () => {
    vi.stubEnv("APIFY_TOKEN", "test-only");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const res = await analyze(
      request("/api/analyze", {
        linkedinUrl: "https://linkedin.com/company/ada",
        instagramUrl: "https://instagram.com/ada",
        consent: true,
      }),
    );
    expect(res.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("handles missing reader credentials with a meaningful response", async () => {
    vi.stubEnv("APIFY_TOKEN", "");
    const res = await analyze(
      request("/api/analyze", {
        linkedinUrl: "https://linkedin.com/in/ada",
        instagramUrl: "https://instagram.com/ada",
        consent: true,
      }),
    );
    expect(res.status).toBe(503);
    expect(await res.text()).toContain("APIFY_TOKEN");
  });
  it("streams a source-backed fallback card with the two normalized URLs", async () => {
    vi.stubEnv("APIFY_TOKEN", "test-only");
    vi.stubEnv("OPENROUTER_API_KEY", "");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => ({
        ok: true,
        json: async () =>
          String(url).includes("instagram")
            ? [
                {
                  username: "ada",
                  fullName: "Ada Example",
                  isPrivate: false,
                  biography: "Coffee and photography",
                },
              ]
            : [
                {
                  success: true,
                  status: "success",
                  error: null,
                  profile: {
                    fullName: "Ada Example",
                    headline: "Software engineer",
                    about: "I build software",
                  },
                },
              ],
      })),
    );
    const res = await analyze(
      request("/api/analyze", {
        linkedinUrl: "https://linkedin.com/in/ada",
        instagramUrl: "https://instagram.com/ada",
        consent: true,
      }),
    );
    const events: Record<string, unknown>[] = [];
    await consumeEvents(res, (e) => events.push(e));
    expect(events.filter((e) => e.type === "progress")).toHaveLength(5);
    const final = events.at(-1)!;
    expect(final.type).toBe("person");
    expect(final.uncertain).toBe(false);
    expect((final.person as { sources: unknown }).sources).toEqual({
      linkedinUrl: "https://www.linkedin.com/in/ada/",
      instagramUrl: "https://www.instagram.com/ada/",
    });
  });
  it("blocks private Instagram before requesting LinkedIn", async () => {
    vi.stubEnv("APIFY_TOKEN", "test-only");
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ username: "ada", isPrivate: true }],
    });
    vi.stubGlobal("fetch", fetcher);
    const res = await analyze(
      request("/api/analyze", {
        linkedinUrl: "https://linkedin.com/in/ada",
        instagramUrl: "https://instagram.com/ada",
        consent: true,
      }),
    );
    await expect(consumeEvents(res, () => {})).rejects.toThrow(
      "This Instagram is private",
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("returns uncertain identity to the client for confirmation", async () => {
    vi.stubEnv("APIFY_TOKEN", "test-only");
    vi.stubEnv("OPENROUTER_API_KEY", "");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => ({
        ok: true,
        json: async () =>
          String(url).includes("instagram")
            ? [
                {
                  username: "bob",
                  fullName: "Bob Other",
                  isPrivate: false,
                  biography: "",
                },
              ]
            : [{ fullName: "Ada Example", headline: "Software engineer" }],
      })),
    );
    const events: Record<string, unknown>[] = [];
    await consumeEvents(
      await analyze(
        request("/api/analyze", {
          linkedinUrl: "https://linkedin.com/in/ada",
          instagramUrl: "https://instagram.com/bob",
          consent: true,
        }),
      ),
      (e) => events.push(e),
    );
    expect(events.at(-1)?.uncertain).toBe(true);
  });
  it("streams a full live fallback date on the browser-facing host", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const events: Record<string, unknown>[] = [];
    const res = await date(
      request("/api/date/live", { a: data.people[0], b: data.people[1] }),
    );
    expect(res.headers.get("content-type")).toBe("text/event-stream");
    await consumeEvents(res, (e) => events.push(e));
    expect(events[0].type).toBe("date_started");
    expect(events.filter((e) => e.type === "agent_message")).toHaveLength(6);
    expect(events.at(-1)?.type).toBe("date_finished");
    expect((events.at(-1)?.date as { mode: string }).mode).toBe("fallback");
  });
});
