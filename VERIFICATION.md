# Release verification — 4 October 2026

Completed locally against the continued checkout:

- Clean `npm ci` passed with Node 22.23.2.
- `npm run typecheck` passed.
- `npm test` passed: 28 tests, including server-route streams and mocked successful model turns.
- `npm run build` passed: 118 generated route entries; no provider credentials needed.
- `npm audit` reported zero vulnerabilities after updating Vitest to 4.1.11.
- `node scripts/smoke-http.mjs` checked 113 user-facing production routes, all returning HTTP 200. Every profile's rendered HTML includes Needs, Hobbies, and Interests.
- Invalid LinkedIn URLs were rejected before spending; a production live fallback returned six messages, a curveball, and two outcomes.
- Browser checks covered cast, profile analysis, evidence receipts, replay controls, directional results, asymmetric ranking, and expandable explanations.
- Production Lab browser checks covered adding three fictional agents, choosing a pair, running a six-turn fallback date, showing its post-date score in rankings, and retaining profiles and dates after reload.
- Mobile ranking layout was checked at 390×844; no horizontal body overflow was observed.
- `npm run demo:build` fails clearly with the empty real-person seed and preserves the shipped JSON. It does not silently fabricate participants.

## Limits of this verification

Apify and OpenRouter credentials are absent. No real scrape, successful real model provider request, verified 25-real-person cast, or Vercel deployment was claimed. Provider integrations were exercised with test responses; actual live provider availability requires credentials and real participant links. The shipped cast, receipts, preferences, and replay outcomes remain explicitly fictional. Real romantic needs are not inferred from public profiles.

The local production preview runs at http://localhost:3001. The offline showcase and fallback orchestration work without credentials. See README for setup, server environment values, dataset generation, and deployment.
