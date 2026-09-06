# Edward Song — Product Engineering Portfolio

![Edward Song portfolio preview](./public/og/edward-song-zen.png)

Source for [Edward Song's portfolio](https://www.edsong.xyz/), presenting selected product engineering, systems work, technical leadership, and production delivery. **Coolify is the primary production host; Vercel is the backup deployment.**

## What this portfolio demonstrates

- Product and systems direction across ambiguous, workflow-heavy problems
- Hands-on application engineering spanning interfaces, services, data, and integrations
- Security and operational controls including validation, server authority, RBAC/RLS, and audit history
- Technical leadership across software, UI/UX, network engineering, and IT operations

## Selected work

| Work | Scope | Evidence |
| --- | --- | --- |
| TROA Nonprofit | Organization-wide technology, operations, and community systems | [Portfolio slide](https://www.edsong.xyz/#project-troa-nonprofit) |
| TROA Gaming | Space Engineers realm infrastructure and an interactive 3D map | [Interactive slide](https://www.edsong.xyz/#project-troa-gaming) |
| Ryu Legal | End-to-end technology ownership, client-site delivery, and ongoing maintenance | [Portfolio slide](https://www.edsong.xyz/#project-ryu) |
| 4ME OS | Research build for permission-scoped context and governed proposals | [Independent systems](https://www.edsong.xyz/#systems) |
| Newsroom | Live publication and editorial workflow | [Independent systems](https://www.edsong.xyz/#systems) |
| ES/HUB | Living map of projects and their connected infrastructure | [Explore the Hub](https://hub.edsong.xyz/) |

ClaimChain appears as compact earlier work. The main page prioritizes current evidence over separate case-study navigation; legacy `/work/*` routes remain available. The visual direction is **negative space / zen**: restrained typography, generous spacing, and a stable three-slide showcase, not a dense capability grid.

## Stack

- Next.js Pages Router, React, TypeScript, and Tailwind CSS
- Framer Motion and next-themes
- OGL-powered interactive visual treatment
- Resend for contact-form delivery
- Coolify production deployment (Railpack, Node runtime); Vercel backup

## Local development

Use Node.js 20.9 or later (Node 22 is used in CI).

```bash
npm ci
npm run dev
```

Create `.env.local` with the Resend API key required by the contact route:

```env
RESEND_API_KEY=re_your_key_here
```

Never commit `.env.local` or any production key.

## Quality checks

```bash
npm run lint
npm run lint:css
npm run typecheck
npm run test:unit
npm run build
npm audit --omit=dev --audit-level=high
```

`npm test` runs linting, type-checking, and unit tests together. GitHub Actions runs the full suite, including the production build and dependency audit, on pull requests and updates to `master`.

## Contact form safeguards

The `/api/contact` route validates and limits request bodies server-side, escapes email HTML, uses a honeypot, verifies same-origin browser requests, and applies an in-memory per-instance rate limit. The rate limit is intentionally a baseline; it resets on restart and is not shared across replicas or hosts. Add a durable shared limiter, such as Redis-backed limits plus suitable edge protections, before expecting protection across multiple instances or sustained abuse. Do not submit the production form as a deployment smoke test: it sends real email.

## SEO and deployment

The canonical production URL is `https://www.edsong.xyz/`; `https://edsong.xyz/` also serves the site. Both public hosts are served through Cloudflare and were verified against the Coolify origin on 2026-09-06. The project ships canonical metadata, Open Graph/Twitter metadata, JSON-LD profile data, `robots.txt`, `sitemap.xml`, favicon, and baseline security headers.

Release the `master` branch through **Coolify → Edward Song → production → final-profile-coolify**. Vercel remains a backup, not the production release authority; a successful Vercel deployment alone does not prove the public site has updated. See [the deployment runbook](docs/deployment.md) for release order, verification, and rollback.
