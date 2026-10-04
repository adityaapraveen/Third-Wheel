import { describe, it, expect } from "vitest";
import data from "../src/data/demo.generated.json";
import { PersonaSchema } from "../src/lib/persona/schema";
import { startLife, LifeStateSchema } from "../src/lib/life/schema";
import { stepDemoLife, tasksForTick } from "../src/lib/life/tasks";
const a = PersonaSchema.parse(data.people[0]),
  b = PersonaSchema.parse(data.people[1]);
describe("offline household tasks", () => {
  it("completes a full day without model calls, records work, and swaps tomorrow's responsibilities", () => {
    const initial = startLife(a, b);
    let state = initial;
    for (let i = 0; i < 6; i++)
      state = LifeStateSchema.parse(stepDemoLife(state));
    expect(state.tick).toBe(6);
    expect(state.modelCalls).toBe(0);
    expect(state.events.filter((e) => e.kind === "scene")).toHaveLength(12);
    expect(state.events.every((e) => e.mode === "demo")).toBe(true);
    expect(state.events.some((e) => e.text.includes("website feature"))).toBe(
      true,
    );
    expect(state.events.some((e) => e.text.includes("flower patch"))).toBe(
      true,
    );
    expect(tasksForTick(6)[0]).toEqual(tasksForTick(0)[1]);
    expect(initial.events).toHaveLength(0);
  });
  it("bounds history and memory during continuous offline playback", () => {
    let state = startLife(a, b);
    for (let i = 0; i < 100; i++) state = stepDemoLife(state);
    expect(LifeStateSchema.safeParse(state).success).toBe(true);
    expect(state.events).toHaveLength(120);
    expect(state.memories).toHaveLength(24);
    expect(state.revision).toBe(100);
  });
});
