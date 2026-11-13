# Work log

## 2026-11-13 — profile domain migration

- Edward explicitly requested moving the existing public profile to profile.edsong.xyz, making the current contact site the edsong.xyz homepage, preserving old contact links, and pushing/deploying the migration.
- Isolated the work from the deployed origin/master revision to avoid publishing unrelated local profile drafts. Updated canonical, Open Graph, JSON-LD, robots, sitemap, and active deployment documentation to the profile hostname.
- Added project guidance/context and coordinated the map embed origin and Hub profile-link changes. Profile design, local drafts, and mail credentials were not changed.
- Verification: lint, CSS lint, TypeScript, 25 unit tests, the pinned-Node production build, and the production dependency audit passed. No live email was sent.
- Functional release 1a505d1 deployed successfully through the existing master webhook. Public HTTPS, canonical metadata, /work/troa, and the resume PDF are verified at profile.edsong.xyz. Browser review confirmed the existing profile and embedded Hub load at the new address. The contact app now serves the old main domain and redirects old profile deep links here; all 23 cross-site migration checks passed.
- Map release 8dcd002 and Hub release 0a09492 are deployed with the new profile origin/link. The original final-profile checkout and its unrelated drafts remain untouched. Final documentation records the completed routing rather than pending cutover steps.
