import { afterEach, describe, expect, it, vi } from "vitest";
import data from "../src/data/demo.generated.json";
import { PersonaSchema } from "../src/lib/persona/schema";
import { startLife, LifeStateSchema, clock } from "../src/lib/life/schema";
import { stepLife } from "../src/lib/life/engine";
const a = PersonaSchema.parse(data.people[0]),
  b = PersonaSchema.parse(data.people[1]);
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("persistent fictional life", () => {
  it("moves the clock across days and validates its saved state", () => {
    expect(clock(5).day).toBe(1);
    expect(clock(6).day).toBe(2);
    expect(
      LifeStateSchema.parse(startLife(a, b)).participants.map((p) => p.id),
    ).toEqual([a.id, b.id]);
  });
  it("does not buy model calls for work and sleep", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    for (const tick of [1, 5]) {
      const before = { ...startLife(a, b), tick };
      const next = await stepLife(before);
      expect(next.tick).toBe(tick + 1);
      expect(next.events).toHaveLength(1);
      expect(next.events[0].kind).toBe("world");
      expect(next.modelCalls).toBe(0);
      expect(fetcher).not.toHaveBeenCalled();
    }
  });
  it("runs independent alternating model turns, carrying the partner message", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-only");
    const inputs: unknown[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, init) => {
        const request = JSON.parse(init.body);
        inputs.push(JSON.parse(request.messages[1].content));
        return {
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    kind: "text",
                    text:
                      inputs.length === 1
                        ? "Could we cook together?"
                        : "Yes, after I finish this.",
                    memory: "A fictional dinner plan.",
                    warmthDelta: 1,
                    tensionDelta: 0,
                  }),
                },
              },
            ],
          }),
        };
      }),
    );
    const before = startLife(a, b),
      next = await stepLife(before);
    expect(next.events.map((e) => e.agentId)).toEqual([a.id, b.id]);
    expect((inputs[1] as { partnerMessage: string }).partnerMessage).toBe(
      "Could we cook together?",
    );
    expect(next.memories).toHaveLength(2);
    expect(next.revision).toBe(before.revision + 1);
    expect(next.warmth).toBe(57);
    expect(next.modelCalls).toBe(2);
  });
  it("remembers previous events and bounds context during long runs", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const before = startLife(a, b);
    before.events = Array.from({ length: 120 }, (_, i) => ({
      id: `old-${i}`,
      tick: i,
      agentId: a.id,
      kind: "text",
      text: "An earlier fictional conversation.",
      mode: "fallback",
    }));
    before.memories = Array.from({ length: 24 }, (_, i) => `Promise ${i}`);
    const next = await stepLife(before);
    expect(next.events).toHaveLength(120);
    expect(next.memories).toHaveLength(24);
    expect(next.events.at(-1)?.mode).toBe("fallback");
    expect(before.events.at(-1)?.id).toBe("old-119");
  });
  it("pauses without issuing another model turn", async () => {
    const controller = new AbortController();
    controller.abort();
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(stepLife(startLife(a, b), controller.signal)).rejects.toThrow(
      "paused",
    );
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("cancels an in-flight provider call without retrying or saving a turn", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-only");
    const controller = new AbortController();
    const fetcher = vi.fn(async (_url, init) => {
      controller.abort();
      expect(init.signal.aborted).toBe(true);
      throw new DOMException("Canceled", "AbortError");
    });
    vi.stubGlobal("fetch", fetcher);
    const before = startLife(a, b);
    await expect(stepLife(before, controller.signal)).rejects.toThrow("paused");
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(before.events).toHaveLength(0);
    expect(before.tick).toBe(0);
  });
});
