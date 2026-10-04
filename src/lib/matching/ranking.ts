import type { Persona, DateRecord, Ranking } from "../persona/schema";
import { scoreCandidate } from "./compatibility";
export function rankAll(
  people: Persona[],
  dates: DateRecord[] = [],
): Record<string, Ranking[]> {
  return Object.fromEntries(
    people.map((viewer) => [
      viewer.id,
      people
        .filter((c) => c.id !== viewer.id)
        .map((candidate) => {
          const result = scoreCandidate(viewer, candidate);
          const date = [...dates]
            .reverse()
            .find(
              (d) =>
                d.participantIds.includes(viewer.id) &&
                d.participantIds.includes(candidate.id),
            );
          const outcome = date?.outcomes.find((o) => o.agentId === viewer.id);
          return {
            candidateId: candidate.id,
            rank: 0,
            compatibilityScore: result.score,
            dateScore: outcome?.score ?? null,
            finalScore: Math.round(
              outcome ? result.score * 0.7 + outcome.score * 0.3 : result.score,
            ),
            confidence: result.confidence,
            why: result.why,
            friction: result.friction,
            sharedThreads: result.sharedThreads,
            dateId: date?.id ?? null,
          };
        })
        .sort(
          (a, b) =>
            b.finalScore - a.finalScore ||
            a.candidateId.localeCompare(b.candidateId),
        )
        .map((r, i) => ({ ...r, rank: i + 1 })),
    ]),
  );
}
export function isMutual(
  rankings: Record<string, Ranking[]>,
  a: string,
  b: string,
) {
  return (
    (rankings[a]?.find((r) => r.candidateId === b)?.rank ?? 99) <= 5 &&
    (rankings[b]?.find((r) => r.candidateId === a)?.rank ?? 99) <= 5
  );
}
