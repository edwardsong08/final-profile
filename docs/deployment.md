# Portfolio deployment runbook

## Hosting roles

Verified 2026-09-06:

| Role | Target |
| --- | --- |
| Primary production | Coolify: Edward Song → production → `final-profile-coolify` |
| Public hosts | `https://edsong.xyz/` and canonical `https://www.edsong.xyz/`, through Cloudflare |
| Source | `edwardsong08/final-profile`, branch `master`, commit setting `HEAD` |
| Build/runtime | Railpack, Next.js Node server, exposed port 3000; `npm run build` / `npm run start` |
| Backup | Connected Vercel `final-profile` project |

The public hosts and Coolify origin returned matching Next.js build IDs when checked. Recheck routing when hosting changes; do not infer the active origin from a README or a successful backup build. A backup deployment is not evidence of automatic failover. Leave DNS, tunnels, and Vercel bindings unchanged during an ordinary code release.

## Release sequence

1. Inspect the diff and stage only intended source, docs, and public assets. Exclude local screenshots under `artifacts/`, unrelated image experiments, and secrets.
2. Run `npm test`, `npm run build`, and `npm audit --omit=dev --audit-level=high`. GitHub Actions runs the equivalent checks on `master` and pull requests.
3. If the map embed contract changed, release its repository first (see below) and verify it live.
4. Commit and push `master`. In Coolify, confirm a deployment for that exact commit starts. If no webhook deployment starts, use the existing app's **Actions → Deploy** control; do not create a replacement app or change source settings.
5. Wait for that deployment to report **Success**, then verify both public hosts. A push, CI pass, old Running badge, or Vercel success is not sufficient release proof.
6. Confirm new page content and assets; check the three showcase tabs on desktop and mobile, map object selection, and Hub scroll containment. Do not submit the live contact form.

The Vercel backup may build from the same push. Its success or failure should be reported separately from primary production; do not promote it or reassign domains as part of an ordinary release.

## Interactive showcase dependencies

### TROA map

- Source: `troainc/troa-realms-map-v2`, branch `main`; local checkout `TROA/troa-realms-map-main`.
- Host: its existing TROA Coolify application at `https://troa-realms.therealmsofasgard.com`.
- The profile loads `/map` with `embed=profile` and the selected realm/object parameters. It uses the real scene and miniature non-interactive HUD, with explicitly labeled static preview chat rather than a live chat feed.
- External object buttons send `troa-profile-map-select` messages. The map accepts only its parent window and approved profile origins (`https://edsong.xyz`, `https://www.edsong.xyz`; localhost only in development), and validates the object ID.
- Keep the iframe mounted after its first activation so object selection can transition within the loaded scene. Embed mode preloads object assets and uses medium quality without changing normal map preferences.
- Local profile development expects the map frontend on `http://localhost:5173`. The profile's production CSP and iframe URL use the public map host instead.
- When changing this integration, deploy and verify the map before the profile. On both public profile origins, select another object and confirm the camera/detail card updates without an iframe reload.

### Hub

The Hub remains a separately deployed application at `https://hub.edsong.xyz/`. The portfolio embeds its living systems map. Keep page scrolling contained while the pointer is interacting with the Hub preview; normal document scrolling should resume outside it. A portfolio-only change does not require redeploying the Hub.

The profile uses the Hub's `/embed/profile` route. Its native Map view owns the animated mouse/touch hint, so switching to Index removes the hint automatically. Release the Hub route before the portfolio that references it. For local development, run `node node_modules/next/dist/bin/next dev --port 3001` in `TOOLS AND FUN/HUB/Main-Hub`; the profile dev server embeds that local route. Production remains on the public Hub host.

## Environment and rollback

Keep `RESEND_API_KEY` in the primary host's environment configuration and provision the backup independently if it must handle contact submissions. Never copy credentials into repository files or deployment notes. Contact throttling is per process, not shared across replicas or the backup host.

Before release, note the previous successful Coolify commit. If the new release fails validation, redeploy that known-good version through the existing application's rollback/deployment controls and verify both public hosts again. Check compatibility with the separately deployed map; avoid rolling back unrelated map functionality unnecessarily. Switching the public domain to Vercel is a separate operational change requiring explicit authorization and verification.
