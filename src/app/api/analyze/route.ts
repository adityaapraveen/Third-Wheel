import { NextRequest, NextResponse } from "next/server";
import { AnalyzeInput, profileUrl } from "@/lib/validation";
import { readLinkedIn } from "@/lib/scrapers/linkedin";
import { readInstagram } from "@/lib/scrapers/instagram";
import { sourceLock } from "@/lib/persona/identity";
import { generatePersona } from "@/lib/persona/generate";
import { guard, limitedJSON, eventResponse } from "@/lib/server";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(req: NextRequest) {
  try {
    const input = AnalyzeInput.parse(await limitedJSON(req, 3000));
    guard(req, "analyze", 4, input.accessCode);
    const liURL = profileUrl(input.linkedinUrl, "linkedin"),
      igURL = profileUrl(input.instagramUrl, "instagram");
    if (!process.env.APIFY_TOKEN)
      return NextResponse.json(
        {
          error:
            "Add APIFY_TOKEN to the server environment to read public profiles. The demo works without credentials.",
        },
        { status: 503 },
      );
    return eventResponse(async (send) => {
      send({ type: "progress", step: "Checking links" });
      // Instagram first: reject private sources before spending on LinkedIn.
      send({ type: "progress", step: "Reading Instagram" });
      const ig = await readInstagram(igURL);
      if (req.signal.aborted) return;
      send({ type: "progress", step: "Reading LinkedIn" });
      const li = await readLinkedIn(liURL);
      send({ type: "progress", step: "Locking identity" });
      const lock = sourceLock(li, ig);
      const id = crypto.randomUUID();
      send({ type: "progress", step: "Building agent" });
      const person = await generatePersona(id, li, ig);
      send({ type: "person", person, uncertain: lock.identityConfidence < 65 });
    }, req.signal);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }
}
