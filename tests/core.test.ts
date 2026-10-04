import { afterEach, describe, expect, it, vi } from "vitest";
import data from "../src/data/demo.generated.json";
import { PersonaSchema, type Persona } from "../src/lib/persona/schema";
import { profileUrl } from "../src/lib/validation";
import {
  normalizeInstagram,
  normalizeLinkedIn,
} from "../src/lib/scrapers/normalize";
import { sourceLock } from "../src/lib/persona/identity";
import { roundRobin, curveballFor } from "../src/lib/matching/roundRobin";
import { scoreCandidate } from "../src/lib/matching/compatibility";
import { rankAll, isMutual } from "../src/lib/matching/ranking";
import { DateOrchestrator } from "../src/lib/agents/DateOrchestrator";
import { generatePersona } from "../src/lib/persona/generate";
import { useSession } from "../src/store/session";
const people = data.people.map((p) => PersonaSchema.parse(p));
const li = () =>
  normalizeLinkedIn(
    {
      fullName: "Ada Example",
      headline: "Software engineer",
      about: "I build software and enjoy photography",
    },
    "https://www.linkedin.com/in/ada-example/",
  );
const ig = () =>
  normalizeInstagram(
    {
      username: "adaexample",
      fullName: "Ada Example",
      isPrivate: false,
      biography: "Software engineer. Coffee and photography.",
      latestPosts: [{ caption: "A camera and a new trail." }],
    },
    "https://www.instagram.com/adaexample/",
  );
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("input boundary", () => {
  it("canonicalizes public links and strips tracking", () => {
    expect(
      profileUrl("https://linkedin.com/in/ada/?tracking=1", "linkedin"),
    ).toBe("https://www.linkedin.com/in/ada/");
    expect(
      profileUrl("https://instagram.com/Ada.Example/?igsh=1", "instagram"),
    ).toBe("https://www.instagram.com/ada.example/");
  });
  it.each([
    "http://instagram.com/ada/",
    "https://instagram.com.evil.test/ada/",
    "https://instagram.com/p/",
    "https://instagram.com/reel/x/",
    "https://user:pass@instagram.com/ada/",
    "https://instagram.com:4433/ada/",
  ])("rejects unsafe or non-profile URL %s", (url) =>
    expect(() => profileUrl(url, "instagram")).toThrow(),
  );
  it("rejects company LinkedIn URLs", () =>
    expect(() =>
      profileUrl("https://linkedin.com/company/example/", "linkedin"),
    ).toThrow());
  it("blocks private and unconfirmed Instagram", () => {
    expect(() =>
      normalizeInstagram({ username: "ada", isPrivate: true }, ""),
    ).toThrow("private");
    expect(() => normalizeInstagram({ username: "ada" }, "")).toThrow(
      "did not confirm",
    );
  });
  it("uses at most 12 public captions", () =>
    expect(
      normalizeInstagram(
        {
          username: "ada",
          isPrivate: false,
          latestPosts: Array.from({ length: 30 }, () => ({
            caption: "coffee",
          })),
        },
        "",
      ).captions,
    ).toHaveLength(12));
  it("warns about mismatched names", () => {
    expect(sourceLock(li(), ig()).identityConfidence).toBeGreaterThanOrEqual(
      65,
    );
    expect(
      sourceLock(li(), {
        ...ig(),
        fullName: "Bob Other",
        username: "bobother",
        biography: "",
      }).identityConfidence,
    ).toBeLessThan(65);
  });
});
describe("ranking invariants", () => {
  it("ships 25 validated cards with evidence references", () => {
    expect(people).toHaveLength(25);
    for (const p of people) {
      const ids = new Set(p.evidence.map((e) => e.id));
      for (const s of [
        ...p.needs,
        ...p.hobbies,
        ...p.interests,
        ...p.values,
        ...p.conversationHooks,
      ])
        expect(s.evidenceIds.every((id) => ids.has(id))).toBe(true);
    }
  });
  it("schedules 60 unique pairings with at least four dates per agent", () => {
    const schedule = roundRobin(
      people.map((p) => p.id),
      5,
    );
    expect(schedule).toHaveLength(60);
    expect(new Set(schedule.map((p) => [p.a, p.b].sort().join(":"))).size).toBe(
      60,
    );
    for (const p of people)
      expect(
        schedule.filter((d) => d.a === p.id || d.b === p.id).length,
      ).toBeGreaterThanOrEqual(4);
    expect(curveballFor("a", "b")).toBe(curveballFor("b", "a"));
  });
  it("ranks all other candidates, never self, in deterministic order", () => {
    const rankings = rankAll(people);
    for (const p of people) {
      const rows = rankings[p.id];
      expect(rows).toHaveLength(24);
      expect(rows.some((r) => r.candidateId === p.id)).toBe(false);
      expect(rows.map((r) => r.rank)).toEqual(
        Array.from({ length: 24 }, (_, i) => i + 1),
      );
      expect(
        rows.every((r, i) => !i || rows[i - 1].finalScore >= r.finalScore),
      ).toBe(true);
    }
    expect(rankAll(people)).toEqual(rankings);
  });
  it("is directional when preferences differ", () =>
    expect(scoreCandidate(people[0], people[1]).score).not.toBe(
      scoreCandidate(people[1], people[0]).score,
    ));
  it("blends each agent outcome separately and recognizes mutuals", () => {
    const rankings = rankAll(
      people,
      data.dates as unknown as Parameters<typeof rankAll>[1],
    );
    const d = data.dates[0];
    for (const o of d.outcomes) {
      const row = rankings[o.agentId].find(
        (r) => r.candidateId === o.candidateId,
      )!;
      expect(row.finalScore).toBe(
        Math.round(row.compatibilityScore * 0.7 + o.score * 0.3),
      );
    }
    for (const p of people)
      for (const r of rankings[p.id])
        expect(isMutual(rankings, p.id, r.candidateId)).toBe(
          isMutual(rankings, r.candidateId, p.id),
        );
  });
});
describe("agent and persona failures", () => {
  it("runs six alternating fallback turns and two outcomes without a model key", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const events: string[] = [];
    const d = await new DateOrchestrator(people[0], people[1]).run((e) =>
      events.push(e.type),
    );
    expect(d.mode).toBe("fallback");
    expect(d.messages.map((m) => m.agentId)).toEqual([
      people[0].id,
      people[1].id,
      people[0].id,
      people[1].id,
      people[0].id,
      people[1].id,
    ]);
    expect(d.outcomes).toHaveLength(2);
    expect(events.filter((t) => t === "curveball")).toHaveLength(1);
    expect(events.at(-1)).toBe("date_finished");
  });
  it("stops orchestration when cancelled", async () => {
    const abort = new AbortController();
    abort.abort();
    await expect(
      new DateOrchestrator(people[0], people[1]).run(() => {}, abort.signal),
    ).rejects.toThrow("cancelled");
  });
  it("falls back on invalid model JSON and retries once", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-only");
    const fetcher = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: "bad json" } }] }),
      });
    vi.stubGlobal("fetch", fetcher);
    const p = await generatePersona("ada", li(), ig());
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(p.analysisMode).toBe("fallback");
    expect(p.interests.some((s) => s.label === "Photography")).toBe(true);
    expect(p.confidence.overall).toBeLessThanOrEqual(55);
  });
  it("never uses unrecognized evidence IDs", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-only");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    ...people[0],
                    interests: [
                      {
                        label: "Invented",
                        confidence: 99,
                        evidenceIds: ["not-in-sources"],
                      },
                    ],
                  }),
                },
              },
            ],
          }),
        }),
    );
    const p = await generatePersona("ada", li(), ig());
    expect(p.analysisMode).toBe("fallback");
    expect(p.interests.some((s) => s.label === "Invented")).toBe(false);
  });
});

describe("provider success", () => {
  it("runs the model for six dependent turns and two directional reflections", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-only");
    const requests: Record<string, unknown>[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, init) => {
        const body = JSON.parse(init.body as string);
        requests.push(body);
        const reflection = body.messages[0].content.includes("Evaluate ONLY");
        const content = reflection
          ? {
              score: requests.length === 7 ? 87 : 72,
              wantsAnotherDate: true,
              summary: "There is another conversation here.",
            }
          : {
              message: `A grounded question at turn ${requests.length}.`,
              publicConfessional: "A concise public summary.",
              engagementDelta: 3,
            };
        return {
          ok: true,
          json: async () => ({
            choices: [{ message: { content: JSON.stringify(content) } }],
          }),
        };
      }),
    );
    const result = await new DateOrchestrator(people[0], people[1]).run(
      () => {},
    );
    expect(result.mode).toBe("model");
    expect(requests).toHaveLength(8);
    expect(result.outcomes.map((o) => o.score)).toEqual([87, 72]);
    for (let i = 1; i < 6; i++) {
      const messages = requests[i].messages as { content: string }[];
      const input = JSON.parse(messages[1].content);
      expect(input.conversation).toHaveLength(i);
      expect(input.conversation.at(-1).message).toBe(
        `A grounded question at turn ${i}.`,
      );
    }
    expect(
      result.messages.every(
        (m) => m.publicConfessional.split(/\s+/).length <= 20,
      ),
    ).toBe(true);
  });
});
