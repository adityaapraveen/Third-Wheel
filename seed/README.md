# Participant seed

`people.json` is intentionally empty. The shipped 25-character showcase is fictional, labeled, and reproducible with `npm run demo:fixtures`. No real-person URLs have been fabricated or verified in this checkout.

For a real demo, provide at least 25 adult participants' official public LinkedIn and Instagram URLs in `people.json`, or set `DEMO_SEED_FILE=seed/consented-people.json` for an ignored local seed. Each entry contains only `id`, `linkedinUrl`, and `instagramUrl`; optional `consent:false` excludes publication by failing the builder.

Obtain participant permission before publishing derived cards. The pipeline rejects private or unconfirmed-public Instagram and weak identity overlap. Source Lock is not proof of age or identity. Inspect evidence before publication. Romantic needs are not inferred from public social posts.
