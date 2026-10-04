import type { LifeState, LifeEvent } from "./schema";

export type HouseholdTask = {
  label: string;
  result: string;
  x: number;
  y: number;
  prop:
    | "mug"
    | "laptop"
    | "pencil"
    | "phone"
    | "flower"
    | "ball"
    | "pan"
    | "broom"
    | "sleep";
  say: string;
};
// Deliberately authored actions: deterministic, repeatable, and free for a live demo.
const routine: [HouseholdTask, HouseholdTask][] = [
  [
    {
      label: "Make breakfast",
      result: "made two warm breakfasts",
      x: 175,
      y: 280,
      prop: "pan",
      say: "I saved you the toast with the little heart ♡",
    },
    {
      label: "Brew coffee",
      result: "brewed coffee for two",
      x: 285,
      y: 280,
      prop: "mug",
      say: "Coffee delivery! Yours has extra oat milk.",
    },
  ],
  [
    {
      label: "Build a tiny website",
      result: "finished a small website feature",
      x: 175,
      y: 160,
      prop: "laptop",
      say: "One more little bug. Then lunch, promise.",
    },
    {
      label: "Sketch a chair",
      result: "finished a chair sketch",
      x: 310,
      y: 160,
      prop: "pencil",
      say: "I made the chair look like a cloud ☁",
    },
  ],
  [
    {
      label: "Take a lunch break",
      result: "took a screen-free lunch break",
      x: 345,
      y: 305,
      prop: "mug",
      say: "Lunch on the sofa? Tell me about your morning.",
    },
    {
      label: "Send a check-in",
      result: "sent a kind midday check-in",
      x: 450,
      y: 305,
      prop: "phone",
      say: "Your tiny website deserves a tiny celebration.",
    },
  ],
  [
    {
      label: "Water the garden",
      result: "watered the flower patch",
      x: 155,
      y: 440,
      prop: "flower",
      say: "The flowers are doing better than my to-do list.",
    },
    {
      label: "Play with friends",
      result: "played a game with neighborhood friends",
      x: 470,
      y: 440,
      prop: "ball",
      say: "One last round with the gang. Home for dinner!",
    },
  ],
  [
    {
      label: "Cook dinner",
      result: "cooked a simple dinner to share",
      x: 175,
      y: 280,
      prop: "pan",
      say: "You said you would help. I have two hungry potatoes.",
    },
    {
      label: "Tidy the living room",
      result: "tidied the living room and helped with dinner",
      x: 390,
      y: 305,
      prop: "broom",
      say: "Fair. Sofa first, then I am on potato duty.",
    },
  ],
  [
    {
      label: "Wind down",
      result: "put away the phone and settled down to sleep",
      x: 455,
      y: 190,
      prop: "sleep",
      say: "Same little world, another day. Goodnight ♡",
    },
    {
      label: "Get some rest",
      result: "turned out the lights and rested",
      x: 520,
      y: 190,
      prop: "sleep",
      say: "Goodnight. Tomorrow I am making breakfast.",
    },
  ],
];
export function tasksForTick(tick: number): [HouseholdTask, HouseholdTask] {
  const tasks = routine[tick % 6];
  // Swap responsibilities each day, so care and household work are shared.
  return Math.floor(tick / 6) % 2 ? [tasks[1], tasks[0]] : tasks;
}
export function stepDemoLife(state: LifeState): LifeState {
  const tasks = tasksForTick(state.tick);
  const events: LifeEvent[] = state.participants.flatMap((person, i) => [
    {
      id: `${state.id}:${state.tick}:task:${i}`,
      tick: state.tick,
      agentId: person.id,
      kind: "scene" as const,
      text: `${person.name.split(" ")[0]} ${tasks[i].result}.`,
      mode: "demo" as const,
    },
    {
      id: `${state.id}:${state.tick}:chat:${i}`,
      tick: state.tick,
      agentId: person.id,
      kind: "text" as const,
      text: tasks[i].say,
      mode: "demo" as const,
    },
  ]);
  return {
    ...state,
    tick: state.tick + 1,
    revision: state.revision + 1,
    events: [...state.events, ...events].slice(-120),
    memories: [
      ...state.memories,
      ...events.filter((e) => e.kind === "scene").map((e) => e.text),
    ].slice(-24),
  };
}
