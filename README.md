# Edward Song - Product Engineering Portfolio

![Edward Song portfolio preview](./public/og/edward-song-zen.png)

Source for [Edward Song's portfolio](https://www.edsong.xyz/), presenting selected product engineering, systems work, technical leadership, and production delivery.

Production runs on self-hosted Coolify behind Cloudflare. The portfolio's canonical URL is [edsong.xyz](https://www.edsong.xyz/).

## What this portfolio demonstrates

- Product and systems direction across ambiguous, workflow-heavy problems
- Hands-on application engineering spanning interfaces, services, data, and integrations
- Security and operational controls including validation, server authority, RBAC/RLS, and audit history
- Technical leadership across software, product design, network engineering, and IT operations

## Selected work

| Work | Scope | Evidence |
| --- | --- | --- |
| TROA Nonprofit | Organization-wide technology, operations, and community systems | [Portfolio slide](https://www.edsong.xyz/#project-troa-nonprofit) |
| TROA Gaming | Space Engineers realm infrastructure and an interactive 3D map | [Interactive slide](https://www.edsong.xyz/#project-troa-gaming) |
| Ryu Legal | End-to-end technology ownership, growth, client-site delivery, and ongoing operations | [Portfolio slide](https://www.edsong.xyz/#project-ryu) |
| ES/HUB | A living map of projects, services, infrastructure, and relationships | [Explore the Hub](https://hub.edsong.xyz/) |
| ClaimChain | Earlier startup work: an independent claims-marketplace prototype | [Case study](https://www.edsong.xyz/work/claimchain) |

## Stack

- Next.js Pages Router, React, TypeScript, and Tailwind CSS
- Framer Motion, next-themes, and OGL-powered visual treatment
- Resend for contact-form delivery
- Coolify production deployment with a Node runtime

## Local development

Use Node.js 20.9 or later.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run lint:css
npm run typecheck
npm run test:unit
npm run build
npm audit --omit=dev --audit-level=high
```

GitHub Actions runs the quality checks and production build on pull requests and updates to `master`.
