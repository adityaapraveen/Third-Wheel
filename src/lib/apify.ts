import "server-only";
export async function runActor(
  actor: string,
  input: unknown,
): Promise<Record<string, unknown>[]> {
  const token = process.env.APIFY_TOKEN;
  if (!token)
    throw new Error(
      "Live profile reading needs APIFY_TOKEN on the server. The demo is available without keys.",
    );
  let response: Response;
  try {
    response = await fetch(
      `https://api.apify.com/v2/acts/${encodeURIComponent(actor.replace("/", "~"))}/run-sync-get-dataset-items?timeout=90&memory=256&maxItems=30`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(100000),
        cache: "no-store",
      },
    );
  } catch {
    throw new Error(
      "The public profile reader timed out or could not be reached. Try again later, or use the fictional demo for your presentation.",
    );
  }
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Apify credentials were rejected. Check the server configuration."
        : response.status === 402
          ? "Apify credits or the actor's spending limit have been reached. Check billing and limits in Apify Console."
          : response.status === 403
            ? "Apify denied access to this actor. Check the token permissions and actor access in Apify Console."
            : response.status === 429
              ? "Apify is handling too many requests. Wait a minute before trying again."
              : response.status === 404
                ? "The configured Apify actor is unavailable. Update the server actor setting."
                : `Profile reader failed (${response.status}). Please retry.`,
    );
  const rows: unknown = await response.json();
  if (!Array.isArray(rows) || !rows.length)
    throw new Error(
      "No public profile data was returned. Check the links and retry.",
    );
  return rows
    .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
    .slice(0, 30);
}
