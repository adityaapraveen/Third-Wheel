import {
  existsSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
  renameSync,
} from "node:fs";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import { z } from "zod";
import { profileUrl } from "../src/lib/validation";
import { readInstagram } from "../src/lib/scrapers/instagram";
import { readLinkedIn } from "../src/lib/scrapers/linkedin";
import { generatePersona } from "../src/lib/persona/generate";
import {
  PersonaSchema,
  type Persona,
  type DemoData,
} from "../src/lib/persona/schema";
import { roundRobin } from "../src/lib/matching/roundRobin";
import { rankAll } from "../src/lib/matching/ranking";
import { compactDates } from "../src/lib/agents/compact";

loadEnvConfig(process.cwd());
const Seed = z
  .array(
    z.object({
      id: z.string().regex(/^[a-z0-9-]{1,100}$/),
      linkedinUrl: z.string().max(400),
      instagramUrl: z.string().max(400),
      consent: z.boolean().optional(),
    }),
  )
  .min(25);
async function main() {
  const file = process.env.DEMO_SEED_FILE || "seed/people.json";
  const seed = Seed.parse(JSON.parse(readFileSync(file, "utf8"))).map((p) => ({
    ...p,
    linkedinUrl: profileUrl(p.linkedinUrl, "linkedin"),
    instagramUrl: profileUrl(p.instagramUrl, "instagram"),
  }));
  for (const field of ["id", "linkedinUrl", "instagramUrl"] as const)
    if (new Set(seed.map((p) => p[field])).size !== seed.length)
      throw new Error(
        `Duplicate ${field} in seed. Each participant needs two unique sources.`,
      );
  if (seed.some((p) => p.consent === false))
    throw new Error(
      "Seed contains a participant who declined. Remove them before generation.",
    );
  if (!process.env.APIFY_TOKEN)
    throw new Error(
      "Set APIFY_TOKEN in .env.local before building a real demo. Existing demo is unchanged.",
    );
  // Only sanitized derived personas are cached, never raw provider payloads.
  const cacheDir = resolve("artifacts/demo-cache");
  mkdirSync(cacheDir, { recursive: true });
  const people: Persona[] = [];
  for (let offset = 0; offset < seed.length; offset += 2) {
    const batch = await Promise.all(
      seed.slice(offset, offset + 2).map(async (p) => {
        const cached = resolve(cacheDir, `${p.id}.json`);
        if (existsSync(cached)) {
          const saved = PersonaSchema.parse(
            JSON.parse(readFileSync(cached, "utf8")),
          );
          if (
            saved.sources.linkedinUrl === p.linkedinUrl &&
            saved.sources.instagramUrl === p.instagramUrl
          ) {
            console.log(`Using derived cache: ${p.id}`);
            return saved;
          }
        }
        console.log(`Reading two public sources: ${p.id}`);
        const ig = await readInstagram(p.instagramUrl);
        const li = await readLinkedIn(p.linkedinUrl);
        const person = await generatePersona(p.id, li, ig);
        if (person.identityConfidence < 65)
          throw new Error(
            `Source Lock uncertain for ${p.id}. Verify both submitted links; the published demo was not replaced.`,
          );
        writeFileSync(cached, JSON.stringify(person));
        return person;
      }),
    );
    people.push(...batch);
  }
  const pairs = roundRobin(
    people.map((p) => p.id),
    5,
  ).map((p, i) => ({
    id: `date-${String(i + 1).padStart(2, "0")}`,
    round: p.round,
    a: people.find((x) => x.id === p.a)!,
    b: people.find((x) => x.id === p.b)!,
  }));
  const dates: DemoData["dates"] = [];
  for (let offset = 0; offset < pairs.length; offset += 8) {
    console.log(
      `Generating compact dates ${offset + 1}–${Math.min(offset + 8, pairs.length)}`,
    );
    dates.push(...(await compactDates(pairs.slice(offset, offset + 8))));
  }
  const fallbackCount = dates.filter((d) => d.mode === "fallback").length;
  const data: DemoData = {
    version: 1,
    disclosure: `${people.length} supplied public-profile pairs. Derived from LinkedIn and Instagram only. Identity overlap is a clue, not verification of age or identity. ${fallbackCount} dates use labeled fallback simulation. Agent opinions do not represent the humans.`,
    people,
    dates,
    rankings: rankAll(people, dates),
  };
  const target = resolve("src/data/demo.generated.json");
  writeFileSync(`${target}.tmp`, JSON.stringify(data));
  renameSync(`${target}.tmp`, target);
  console.log(
    `Saved ${people.length} source-backed cards, ${dates.length} dates, ${people.length * (people.length - 1)} directional rankings. ${fallbackCount} fallback dates.`,
  );
}
main().catch((error) => {
  console.error(
    error instanceof z.ZodError
      ? "Seed needs at least 25 unique participant entries with valid public LinkedIn + Instagram links. Existing demo is unchanged."
      : error instanceof Error
        ? error.message
        : "Demo generation failed.",
  );
  process.exitCode = 1;
});
