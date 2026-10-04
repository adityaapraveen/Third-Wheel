import { z } from "zod";
import {
  PersonaSchema,
  type Persona,
  type DateRecord,
} from "../persona/schema";
export const phases = [
  "Morning at home",
  "Work time",
  "A midday text",
  "Their own plans",
  "Evening together",
  "Lights out",
] as const;
export const LifeEventSchema = z.object({
  id: z.string().max(120),
  tick: z.number().int().min(0),
  agentId: z.string().max(100),
  kind: z.enum(["text", "scene", "world"]),
  text: z.string().min(1).max(650),
  mode: z.enum(["model", "fallback", "world"]),
});
export const LifeStateSchema = z.object({
  id: z.string().max(100),
  participants: z.tuple([PersonaSchema, PersonaSchema]),
  tick: z.number().int().min(0).max(1000000),
  events: z.array(LifeEventSchema).max(120),
  memories: z.array(z.string().max(220)).max(24),
  warmth: z.number().min(0).max(100),
  tension: z.number().min(0).max(100),
  modelCalls: z.number().int().min(0),
  revision: z.number().int().min(0),
});
export type LifeState = z.infer<typeof LifeStateSchema>;
export type LifeEvent = z.infer<typeof LifeEventSchema>;
export function startLife(
  a: Persona,
  b: Persona,
  date?: DateRecord,
): LifeState {
  return {
    id: crypto.randomUUID(),
    participants: [a, b],
    tick: 0,
    events: [],
    memories: date
      ? date.messages
          .slice(-4)
          .map((m) => `${m.agentId}: ${m.message}`.slice(0, 220))
      : [],
    warmth: 55,
    tension: 10,
    modelCalls: 0,
    revision: 0,
  };
}
export function clock(tick: number) {
  return {
    day: Math.floor(tick / 6) + 1,
    phase: phases[tick % 6],
    hour: [8, 10, 13, 17, 20, 23][tick % 6],
  };
}
