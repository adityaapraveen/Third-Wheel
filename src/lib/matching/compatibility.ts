import { dimensions, type Persona } from "../persona/schema";
const clamp = (n: number) => Math.max(0, Math.min(100, n));
const close = (a: number, b: number) => 100 - Math.abs(a - b);
const names = (p: Persona) =>
  new Set(p.interests.map((s) => s.label.toLowerCase()));
export function sharedThreads(a: Persona, b: Persona) {
  const bs = names(b);
  return a.interests.map((s) => s.label).filter((s) => bs.has(s.toLowerCase()));
}
export function scoreCandidate(viewer: Persona, candidate: Persona) {
  const a = viewer.datingRead,
    b = candidate.datingRead,
    traits = viewer.matchPreferences.traits;
  const total = traits.reduce((s, t) => s + t.importance, 0);
  const preference = total
    ? traits.reduce(
        (s, t) => s + close(t.desiredValue, b[t.dimension]) * t.importance,
        0,
      ) / total
    : 50;
  const rhythm =
    (close(a.socialEnergy, b.socialEnergy) +
      close(a.routinePreference, b.routinePreference) +
      close(a.adventurePreference, b.adventurePreference)) /
    3;
  const shared = sharedThreads(viewer, candidate),
    union = new Set([...names(viewer), ...names(candidate)]).size;
  const interest = union ? (shared.length / union) * 100 : 50;
  const conversation =
    (close(a.curiosity, b.curiosity) + Math.min(100, 35 + shared.length * 20)) /
    2;
  const ambition = close(a.ambitionPace, b.ambitionPace);
  // Moderate counterbalance, not "identical is always ideal".
  const complementary =
    close(100 - a.spontaneity, b.spontaneity) * 0.6 +
    close(65, b.curiosity) * 0.4;
  const score = Math.round(
    clamp(
      0.3 * preference +
        0.2 * rhythm +
        0.15 * conversation +
        0.15 * ambition +
        0.1 * interest +
        0.1 * complementary,
    ),
  );
  return {
    score,
    confidence: Math.round(
      Math.min(viewer.confidence.overall, candidate.confidence.overall),
    ),
    sharedThreads: shared,
    why: shared.length
      ? `A shared thread in ${shared.slice(0, 2).join(" and ").toLowerCase()}, with room to bring different ideas.`
      : "Different interests; compatible public conversation signals.",
    friction:
      Math.abs(a.spontaneity - b.spontaneity) > 25
        ? "One prefers a plan; the other may rewrite it."
        : Math.abs(a.ambitionPace - b.ambitionPace) > 25
          ? "Work rhythm could require a little negotiation."
          : "Similar rhythms can still hide different expectations. Ask, rather than assume.",
  };
}
export function scoreLabel(score: number) {
  return score >= 90
    ? "dangerously compatible"
    : score >= 82
      ? "worth cancelling plans for"
      : score >= 72
        ? "there is definitely a second date"
        : score >= 60
          ? "interesting plotline"
          : "good person, different movie";
}
export function biggestDifference(a: Persona, b: Persona) {
  return [...dimensions].sort(
    (x, y) =>
      Math.abs(a.datingRead[y] - b.datingRead[y]) -
      Math.abs(a.datingRead[x] - b.datingRead[x]),
  )[0];
}
