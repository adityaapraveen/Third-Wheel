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
  if (row.error || row.errorDescription)
    throw new Error(
      "LinkedIn could not be read. Check that the person profile is publicly accessible.",
    );
  const name = str(
    row.fullName ||
      row.full_name ||
      row.name ||
      [row.firstName, row.lastName].filter(Boolean).join(" "),
    100,
  );
  if (!name)
    throw new Error(
      "LinkedIn returned no readable profile. Try again or replace the configured actor.",
    );
  return {
    name,
    headline: str(row.headline || row.title, 200),
    about: str(row.about || row.summary, 4000),
    location: str(row.locationName || row.location, 120),
    experience: list(row.experiences || row.experience || row.positions),
    education: list(row.educations || row.education),
    skills: list(row.skills),
    certifications: list(row.certifications),
    languages: list(row.languages),
    avatarUrl: safeImageUrl(
      row.profilePicture ||
        row.profilePicUrl ||
        row.profileImageUrl ||
        row.photo,
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
