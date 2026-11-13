<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Profile deployment context

- Read CONTEXT.md and LOGS.md before changing this repository.
- The public profile belongs at https://profile.edsong.xyz. The independent client inquiry site at https://edsong.xyz is a separate repository/application.
- Keep canonical, Open Graph, JSON-LD, sitemap, and robots URLs on the profile hostname. The Resend sender domain remains edsong.xyz; do not change or expose credentials.
- Preserve the existing profile design and the map/Hub embeds. The map must explicitly permit the profile origin before moving it.
- Release master through the existing personal Coolify app. Do not include unrelated local profile drafts in a domain-only release. Do not submit the live mail form as a smoke test.
