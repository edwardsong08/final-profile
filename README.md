# Edward Song Portfolio

Source for [www.edsong.xyz](https://www.edsong.xyz), a Next.js portfolio featuring selected engineering work, skills, and a contact form.

## Stack

- Next.js Pages Router, React, TypeScript, and Tailwind CSS
- Framer Motion and next-themes
- Resend for contact-form delivery
- Vercel deployment

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
npm run typecheck
npm run test:unit
npm run build
npm audit --omit=dev --audit-level=high
```

`npm test` runs linting, type-checking, and unit tests together. GitHub Actions runs the full suite, including the production build and dependency audit, on pull requests and updates to `master`.

## Contact form safeguards

The `/api/contact` route validates and limits request bodies server-side, escapes email HTML, uses a honeypot, verifies same-origin browser requests, and applies an in-memory per-instance rate limit. The rate limit is intentionally a baseline; add a durable shared limiter (for example, Vercel Firewall plus a managed Redis/KV service) before expecting protection across multiple serverless instances or sustained abuse.

## SEO and deployment

The production URL is `https://www.edsong.xyz/`. The project ships a canonical URL, Open Graph/Twitter metadata, JSON-LD profile data, `robots.txt`, `sitemap.xml`, favicon, and baseline security headers. Deploy through the connected Vercel project after CI passes.
