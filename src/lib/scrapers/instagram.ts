import { runActor } from "../apify";
import { normalizeInstagram } from "./normalize";
export async function readInstagram(url: string) {
  const username = new URL(url).pathname.split("/")[1];
  const rows = await runActor(
    process.env.APIFY_INSTAGRAM_ACTOR || "apify/instagram-profile-scraper",
    { usernames: [username], includeAboutSection: false },
  );
  return normalizeInstagram(rows[0], url);
}
