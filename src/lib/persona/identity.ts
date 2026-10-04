import type { LinkedInProfile, InstagramProfile } from "../scrapers/normalize";
const tokens = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .match(/[a-z]{3,}/g) || [];
export function sourceLock(li: LinkedInProfile, ig: InstagramProfile) {
  const a = new Set(tokens(li.name)),
    b = new Set(tokens(ig.fullName));
  const overlap = [...a].filter((t) => b.has(t));
  let confidence = 15;
  const signals: string[] = [];
  if (
    a.size &&
    b.size &&
    overlap.length === a.size &&
    overlap.length === b.size
  ) {
    confidence += 65;
    signals.push("Public names match across both profiles.");
  } else if (overlap.length) {
    confidence += Math.min(35, overlap.length * 18);
    signals.push(`${overlap.length} public name token(s) overlap.`);
  }
  const handle = ig.username.replace(/[_.]/g, "").toLowerCase();
  if (a.size > 1 && [...a].every((t) => handle.includes(t))) {
    confidence += 12;
    signals.push("Instagram handle contains the LinkedIn name.");
  }
  const professional = new Set(
    tokens(li.headline + " " + li.experience.join(" ")),
  );
  const shared = [...new Set(tokens(ig.biography))]
    .filter(
      (t) =>
        professional.has(t) &&
        !["the", "and", "for", "with", "from", "your", "this"].includes(t),
    )
    .slice(0, 3);
  if (shared.length) {
    confidence += Math.min(12, shared.length * 4);
    signals.push(`Public descriptors overlap: ${shared.join(", ")}.`);
  }
  if (ig.biography.includes(li.sourceUrl.replace(/\/$/, ""))) {
    confidence += 30;
    signals.push(
      "Instagram biography links to the submitted LinkedIn profile.",
    );
  }
  if (!signals.length)
    signals.push("No strong overlap found in the two public sources.");
  return {
    identityConfidence: Math.min(99, confidence),
    identitySignals: signals,
  };
}
