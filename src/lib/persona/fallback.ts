import type { LinkedInProfile, InstagramProfile } from "../scrapers/normalize";
import type { Persona, Signal, Evidence } from "./schema";
import { sourceLock } from "./identity";
const subjects: Record<string, RegExp> = {
  "Building things": /build|develop|engineer|code|software/i,
  Design: /design|creative|typograph|illustrat/i,
  Photography: /photo|camera|portrait/i,
  Outdoors: /hik|trail|outdoor|mountain/i,
  Music: /music|guitar|piano|concert|vinyl/i,
  Cooking: /cook|recipe|baking|chef/i,
  Reading: /reading|books|bookshop|literature/i,
  Travel: /travel|backpack|road trip|weekend trip/i,
  Running: /running|runner|marathon/i,
  Coffee: /coffee|espresso|cafe|café/i,
  Learning: /learn|teach|curious|education/i,
  Art: /\bart\b|museum|gallery/i,
  Community: /community|volunteer|meetup/i,
  Games: /gaming|board game|chess/i,
  Writing: /writing|writer|newsletter/i,
};
export function evidenceFrom(
  li: LinkedInProfile,
  ig: InstagramProfile,
): Evidence[] {
  const rows: [Evidence["source"], string, string][] = [
    ["linkedin", li.headline, "Public headline"],
    ["linkedin", li.about, "Public about section"],
    ...li.experience
      .slice(0, 3)
      .map(
        (s) =>
          ["linkedin", s, "Public experience"] as [
            Evidence["source"],
            string,
            string,
          ],
      ),
    ["instagram", ig.biography, "Public biography"],
    ...ig.captions
      .slice(0, 12)
      .map(
        (s) =>
          ["instagram", s, "Public post caption"] as [
            Evidence["source"],
            string,
            string,
          ],
      ),
  ];
  return rows
    .filter(([, text]) => text.trim())
    .map(([source, text, context], i) => ({
      id: `e${i + 1}`,
      source,
      text: text.slice(0, 240),
      context,
    }));
}
export function fallbackPersona(
  id: string,
  li: LinkedInProfile,
  ig: InstagramProfile,
): Persona {
  const evidence = evidenceFrom(li, ig);
  const signals: Signal[] = Object.entries(subjects).flatMap(([label, re]) => {
    const es = evidence.filter((e) => re.test(e.text));
    return es.length
      ? [
          {
            label,
            confidence: Math.min(70, 35 + es.length * 8),
            evidenceIds: es.slice(0, 4).map((e) => e.id),
          },
        ]
      : [];
  });
  const hobbies = signals.filter(
    (s) =>
      ![
        "Building things",
        "Learning",
        "Community",
        "Writing",
        "Design",
      ].includes(s.label),
  );
  const liQ = Math.min(
      85,
      15 + evidence.filter((e) => e.source === "linkedin").length * 12,
    ),
    igQ = Math.min(
      85,
      15 + evidence.filter((e) => e.source === "instagram").length * 8,
    );
  return {
    id,
    name: li.name || ig.fullName || ig.username,
    headline: li.headline,
    avatarUrl: ig.avatarUrl || li.avatarUrl,
    fictional: false,
    analysisMode: "fallback",
    sources: { linkedinUrl: li.sourceUrl, instagramUrl: ig.sourceUrl },
    ...sourceLock(li, ig),
    needs: [],
    hobbies: hobbies.slice(0, 4),
    interests: signals.slice(0, 6),
    values: [],
    conversationHooks: signals.slice(0, 4),
    socialRhythm: "Not enough public evidence to describe a social rhythm.",
    communicationStyle:
      "Public captions provide conversation starting points; private communication style is unknown.",
    datingRead: {
      socialEnergy: 50,
      spontaneity: 50,
      ambitionPace: 50,
      curiosity: 50,
      routinePreference: 50,
      adventurePreference: 50,
    },
    matchPreferences: { traits: [], origin: "neutral" },
    agent: {
      openingStyle: "Ask an open question about an evidenced interest.",
      conversationStyle: "Warm, short, curious. Do not invent experiences.",
      likelyGoodTopics: signals.slice(0, 4).map((s) => s.label),
      dateEnergy: "Curious, low pressure",
    },
    oneLineRead: signals.length
      ? `Public signals suggest an interest in ${signals
          .slice(0, 2)
          .map((s) => s.label.toLowerCase())
          .join(" and ")}.`
      : "A quiet public footprint. Let them tell you more.",
    twoHourTopic: signals[0]?.label || "Ask them what they enjoy",
    idealLowPressureDate:
      "Ask the participant to choose an activity; public profiles do not establish romantic preferences.",
    confidence: {
      overall: Math.min(55, Math.round((liQ + igQ) / 2)),
      linkedin: liQ,
      instagram: igQ,
    },
    evidence,
  };
}
