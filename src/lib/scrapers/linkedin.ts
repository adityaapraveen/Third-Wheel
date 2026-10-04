import { runActor } from "../apify";
import { normalizeLinkedIn } from "./normalize";
export async function readLinkedIn(url: string) {
  const rows = await runActor(
    process.env.APIFY_LINKEDIN_ACTOR ||
      "datascraperes/linkedin-public-profile-scraper",
    { profileUrls: [url] },
  );
  return normalizeLinkedIn(rows[0], url);
}
