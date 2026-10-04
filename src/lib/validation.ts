import { z } from "zod";
export function profileUrl(input: string, source: "linkedin" | "instagram") {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new Error(
      `Enter a valid ${source === "linkedin" ? "LinkedIn" : "Instagram"} profile URL.`,
    );
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port)
    throw new Error("Use an HTTPS public profile URL.");
  const host = url.hostname.toLowerCase();
  if (source === "linkedin") {
    if (
      !["linkedin.com", "www.linkedin.com"].includes(host) ||
      !/^\/in\/[a-zA-Z0-9_%.-]+\/?$/.test(url.pathname)
    )
      throw new Error("LinkedIn must be a linkedin.com/in/… person profile.");
    return `https://www.linkedin.com${url.pathname.replace(/\/$/, "")}/`;
  }
  if (
    !["instagram.com", "www.instagram.com"].includes(host) ||
    !/^\/[a-zA-Z0-9_.]{1,30}\/?$/.test(url.pathname)
  )
    throw new Error("Instagram must be a profile, not a post, reel or story.");
  const username = url.pathname.split("/")[1].toLowerCase();
  if (
    [
      "p",
      "reel",
      "reels",
      "stories",
      "explore",
      "accounts",
      "direct",
      "about",
      "legal",
      "privacy",
      "developer",
    ].includes(username)
  )
    throw new Error("Instagram must be a profile, not a post, reel or story.");
  return `https://www.instagram.com/${username}/`;
}
export const AnalyzeInput = z.object({
  linkedinUrl: z.string().min(1).max(400),
  instagramUrl: z.string().min(1).max(400),
  consent: z.literal(true),
  acceptUncertain: z.boolean().default(false),
  accessCode: z.string().max(200).optional(),
});
export function safeImageUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password ? u.href : "";
  } catch {
    return "";
  }
}
