export const curveballs = [
  "Your flight gets cancelled. You now have six unexpected hours together.",
  "Plan a surprisingly good date with almost no money.",
  "You both get a completely free Sunday tomorrow. What happens?",
  "One of you wants to build something ridiculous. Where do you start?",
  "Your phones die for the evening.",
  "Pick a hobby neither of you does and spend a month learning it.",
  "You accidentally arrive one hour early. What do you do?",
  "You get one spontaneous weekend trip. Where does the energy go?",
  "You have to host dinner for six people together.",
  "You disagree about how to spend a free weekend.",
];
export function pairHash(a: string, b: string) {
  return [...[a, b].sort().join(":")].reduce(
    (h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0,
    0,
  );
}
export function curveballFor(a: string, b: string) {
  return curveballs[pairHash(a, b) % curveballs.length];
}
export function roundRobin(ids: string[], rounds = 5) {
  const ring: (string | null)[] = [...ids];
  if (ring.length % 2) ring.push(null);
  const result: { round: number; a: string; b: string }[] = [];
  for (let r = 0; r < Math.min(rounds, ring.length - 1); r++) {
    for (let i = 0; i < ring.length / 2; i++) {
      const a = ring[i],
        b = ring[ring.length - 1 - i];
      if (a && b) result.push({ round: r + 1, a, b });
    }
    ring.splice(1, 0, ring.pop()!);
  }
  return result;
}
