import { safeImageUrl } from "../validation";
export type LinkedInProfile = {
  name: string;
  headline: string;
  about: string;
  location: string;
  experience: string[];
  education: string[];
  skills: string[];
  certifications: string[];
  languages: string[];
  avatarUrl: string;
  sourceUrl: string;
};
export type InstagramProfile = {
  username: string;
  fullName: string;
  biography: string;
  avatarUrl: string;
  isPrivate: boolean;
  category: string;
  captions: string[];
  sourceUrl: string;
};
type Row = Record<string, unknown>;
const str = (v: unknown, n = 1200) =>
  typeof v === "string" ? v.slice(0, n) : "";
function list(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 12)
    .map((v) =>
      typeof v === "string"
        ? str(v, 300)
        : v && typeof v === "object"
          ? Object.entries(v as Row)
              .filter(([k]) =>
                [
                  "title",
                  "name",
                  "companyName",
                  "company",
                  "description",
                  "schoolName",
                  "degree",
                  "fieldOfStudy",
                ].includes(k),
              )
              .map(([, x]) => str(x, 200))
              .filter(Boolean)
              .join(" · ")
          : "",
    )
    .filter(Boolean);
}
export function normalizeLinkedIn(
  row: Row,
  sourceUrl: string,
): LinkedInProfile {
  const status = typeof row.status === "string" ? row.status : "";
  const failures: Record<string, string> = {
    invalid_url:
      "LinkedIn rejected this link. Use a public person profile URL containing /in/.",
    not_found: "This LinkedIn profile was not found. Check the profile link.",
    login_required:
      "LinkedIn requires a login for this profile. Only public guest profiles can be read; try another public profile.",
    blocked:
      "LinkedIn temporarily blocked the public profile reader. Try again later or use the fictional demo for now.",
    rate_limited:
      "LinkedIn is rate-limiting the public profile reader. Wait a few minutes before trying again.",
    network_error: "The reader could not reach LinkedIn. Try again later.",
    parse_error:
      "The reader could not extract this LinkedIn profile. Try another public profile or report the actor run to its developer.",
  };
  if (row.success === false || (status && status !== "success"))
    throw new Error(
      failures[status] ||
        "LinkedIn could not return a successful public profile. Try another public profile or use the fictional demo.",
    );
  if (row.error || row.errorDescription)
    throw new Error(
      "LinkedIn could not be read. Check that the person profile is publicly accessible.",
    );
  // The default actor wraps successful data in `profile`; alternate actors
  // may return the legacy flat format. Never treat a failure row as a profile.
  const profile =
    row.profile &&
    typeof row.profile === "object" &&
    !Array.isArray(row.profile)
      ? (row.profile as Row)
      : row;
  const name = str(
    profile.fullName ||
      profile.full_name ||
      profile.name ||
      [profile.firstName, profile.lastName].filter(Boolean).join(" "),
    100,
  ).trim();
  if (!name)
    throw new Error(
      "The LinkedIn reader returned a profile without a name. Try another public profile; if it repeats, check the configured actor's output format.",
    );
  return {
    name,
    headline: str(profile.headline || profile.title, 200),
    about: str(profile.about || profile.summary, 4000),
    location: str(profile.locationName || profile.location, 120),
    experience: list(
      profile.experiences || profile.experience || profile.positions,
    ),
    education: list(profile.educations || profile.education),
    skills: list(profile.skills),
    certifications: list(profile.certifications),
    languages: list(profile.languages),
    avatarUrl: safeImageUrl(
      profile.profilePictureUrl ||
        profile.profilePicture ||
        profile.profilePicUrl ||
        profile.profileImageUrl ||
        profile.photo,
    ),
    sourceUrl,
  };
}
export function normalizeInstagram(
  row: Row,
  sourceUrl: string,
): InstagramProfile {
  if (row.error || row.errorDescription)
    throw new Error(
      "Instagram could not be read. Check that the profile exists and is public.",
    );
  if (row.isPrivate === true || row.private === true)
    throw new Error(
      "This Instagram is private. THIRD WHEEL only reads public profiles.",
    );
  // Missing public/private metadata is not proof that a profile is public.
  if (row.isPrivate !== false && row.private !== false)
    throw new Error(
      "Instagram did not confirm this profile is public. Analysis was stopped.",
    );
  const username = str(row.username, 30);
  if (!username) throw new Error("Instagram returned no readable profile.");
  const posts = Array.isArray(row.latestPosts) ? row.latestPosts : [];
  return {
    username,
    fullName: str(row.fullName || row.full_name, 100),
    biography: str(row.biography || row.bio, 1200),
    avatarUrl: safeImageUrl(row.profilePicUrlHD || row.profilePicUrl),
    isPrivate: false,
    category: str(row.businessCategoryName || row.categoryName, 100),
    captions: posts
      .slice(0, 12)
      .map((p) =>
        p && typeof p === "object" ? str((p as Row).caption, 600) : "",
      )
      .filter(Boolean),
    sourceUrl,
  };
}
