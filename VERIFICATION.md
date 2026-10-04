# Release verification — 4 October 2026

Completed locally against the continued checkout:

- Clean `npm ci` passed with Node 22.23.2.
- `npm run typecheck` passed.
- `npm test` passed: 36 tests, including server-route streams, independent life turns, bounded memory, quiet periods, cancellation of an in-flight provider call without retrying, and offline task completion across days.
- `npm run build` passed: 120 generated route entries, including `/life` and `/api/life/step`.
- `npm audit` reported zero vulnerabilities after updating Vitest to 4.1.11.
- `node scripts/smoke-http.mjs` checked 113 user-facing production routes, all returning HTTP 200. Every profile's rendered HTML includes Needs, Hobbies, and Interests.
- Invalid LinkedIn URLs were rejected before spending; a production live fallback returned six messages, a curveball, and two outcomes.
- Browser checks covered cast, profile analysis, evidence receipts, replay controls, directional results, asymmetric ranking, and expandable explanations.
- Production Lab browser checks covered adding three fictional agents, choosing a pair, running a six-turn fallback date, showing its post-date score in rankings, and retaining profiles and dates after reload.
- Mobile ranking layout was checked at 390×844; no horizontal body overflow was observed.
- `npm run demo:build` fails clearly with the empty real-person seed and preserves the shipped JSON. It does not silently fabricate participants.
- Apify and OpenRouter keys are detected in an ignored local environment file. A small real OpenRouter request returned HTTP 200 and valid JSON. A household scene included a real model-generated turn and a clearly labeled fallback turn; free-provider responses were intermittent.
- Life Together browser checks covered household creation, one-step progression, ongoing execution, zero-model work periods, Pause, and refresh retaining the story while stopping execution. At 390×844 there was no horizontal body overflow.
- Visual-world checks covered original block characters, task props, active character/progress animations, breakfast-to-work progression, completed task journal entries, day rollover with swapped responsibilities, Pause, and refresh retention. Desktop 1280×900 and mobile 390×844 had no horizontal overflow. Offline playback retained zero model-turn attempts.

## Limits of this verification

No real scrape, verified 25-real-person cast, or Vercel deployment was claimed. OpenRouter is configured and real model output was observed, but uninterrupted free-provider availability is not guaranteed. The shipped cast, receipts, preferences, replay outcomes, and household events remain explicitly fictional. Real romantic needs or private lives are not inferred from public profiles.

Life execution runs in one browser tab. It pauses on refresh or closure, retains only the latest 120 events and 24 memories, and has no database-backed worker or multi-tab coordination. The visual demo follows authored tasks and dialogue and records simulated completion; it does not create real websites or perform external work. Model mode generates dialogue alongside illustrated routines; model-directed physical action selection, long-term planning, and independent friend agents are not implemented. The warmth/friction scores are simple story state, not validated relationship measurements.

The local production preview runs at http://localhost:3001. The offline showcase and fallback orchestration work without credentials. See README for setup, server environment values, dataset generation, and deployment.
