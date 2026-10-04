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
  const response = await fetch(
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
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Apify credentials were rejected. Check the server configuration."
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
