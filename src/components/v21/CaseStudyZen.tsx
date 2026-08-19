import Link from 'next/link';

import { ProjectEvidence } from './ProjectEvidence';
import styles from './CaseStudyZen.module.css';

export type ProjectId = 'troa' | 'claimchain' | 'ryu-legal';

type ProjectLink = {
  external?: boolean;
  href: string;
  label: string;
};

const projects: Record<ProjectId, {
  decisions: string[];
  eyebrow: string;
  facts: Array<{ label: string; value: string }>;
  intro: string;
  links: ProjectLink[];
  next: { href: string; label: string };
  note: string;
  problem: string;
  state: string;
  status: string;
  title: string;
}> = {
  troa: {
    eyebrow: 'TROA · Volunteer CTO · Active since 2026',
    status: 'Active',
    title: 'Creating and leading TROA’s technology function.',
    intro:
      'TROA’s current product and internal systems are maintained through coordinated stewardship as Volunteer CTO. Technical direction is set with the board, and coordination spans software development, UI/UX design, Network Engineering, and IT Operations.',
    facts: [
      {
        label: 'Organization',
        value: 'More than 50 volunteers and an 800-plus-member Discord community supported by public products, internal operations, training, support, and game services.',
      },
      {
        label: 'Product scope',
        value: 'Public platform, shared accounts, administration, careers, ticketing, LMS, interactive map, grounded assistant, infrastructure, and game-service operations.',
      },
      {
        label: 'Technical organization',
        value: 'A group of roughly ten: two developers, two UI/UX designers, three to four network engineers, and two IT Operations specialists.',
      },
    ],
    problem:
      'TROA’s finance, HR, legal, IT, gaming, and program teams need different workflows, while identity, permissions, reporting, and compliance cross all of them. The challenge is to turn those competing needs into coherent products without collapsing every system into one trust boundary or creating tools that only a developer can operate.',
    decisions: [
      'Build a connected product ecosystem for public services, internal operations, hiring, support, training, mapping, and the assistant rather than treating each request as an isolated site.',
      'Share Supabase identity across applications while keeping privileged reads and writes server-side and restricting each administrative area by role.',
      'Give non-engineer administrators purpose-built workflows for content, people, finance, legal, support, education, and reporting instead of exposing implementation detail.',
      'Remain hands-on in product design and application engineering while giving Network Engineering and IT Operations clear ownership of their specialist work.',
      'Set technical direction with the board and negotiate compliance, scope, timelines, and tradeoffs with the departments affected by each decision.',
    ],
    state:
      'The ecosystem is active and continues to expand. Delivery remains hands-on across design, frontend, backend, data, security, performance, SEO, DevOps, and maintenance while leading the specialists responsible for UI/UX, networking, and IT Operations.',
    note:
      'The public platform is shown here. Administrative, reporting, volunteer, and support tools contain private operational information and are described without exposing their interfaces or data.',
    links: [
      { label: 'Visit public platform', href: 'https://therealmsofasgard.com', external: true },
    ],
    next: { label: 'ClaimChain', href: '/work/claimchain' },
  },
  claimchain: {
    eyebrow: 'ClaimChain · Independent product engineering · 2025–2026',
    status: 'Advanced prototype',
    title: 'Provider submission, admin review, and buyer purchase in one governed workflow.',
    intro:
      'ClaimChain is an independent prototype using test data. Providers submit unpaid claims, administrators review and package them, and buyers purchase anonymized inventory. The product model, data model, advisory service, and staging workflow were implemented to validate this flow.',
    facts: [
      {
        label: 'Workflow',
        value: 'Provider intake, administrator approval and packaging, buyer purchase, and entitled PDF export.',
      },
      {
        label: 'Built across',
        value: 'Next.js, Spring Boot, PostgreSQL, FastAPI, Stripe test payments, and an AWS staging deployment workflow.',
      },
      {
        label: 'Prototype stage',
        value: 'Working portfolio prototype with test data—not an operating claims marketplace.',
      },
    ],
    problem:
      'Interface state, payment redirects, and model output cannot prove eligibility, ownership, payment, or export access. Those decisions must remain authoritative even when a request is retried, a webhook arrives later, or an advisory model returns an incorrect suggestion.',
    decisions: [
      'Enforce eligibility, lifecycle changes, record ownership, and export access in the backend.',
      'Version scoring and package rules so an administrator can understand which rule set produced a result.',
      'Reconcile Stripe webhooks before recording sold state or granting entitled exports.',
      'Allow ML to suggest packages only after deterministic eligibility checks; it cannot approve claims or grant access.',
    ],
    state:
      'The prototype implements account approval, claim intake, administrative review, scoring, packaging, Stripe test purchase, audit activity, and entitled PDF export across the three roles.',
    note:
      'This is a portfolio prototype using test data. Production operation would require additional legal, compliance, privacy, security, and operational review.',
    links: [
      { label: 'Open hosted demo', href: 'https://claimchain-tan.vercel.app', external: true },
      { label: 'View repository', href: 'https://github.com/edwardsong08/ClaimChain', external: true },
      { label: 'Watch walkthrough', href: '/ClaimChain_Demo.mp4', external: true },
    ],
    next: { label: 'Ryu Legal', href: '/work/ryu-legal' },
  },
  'ryu-legal': {
    eyebrow: 'Ryu Legal · Contract engineering · 2022–now',
    status: 'Live and maintained',
    title: 'A live NJ/NY law-firm site with server-validated contact intake.',
    intro:
      'Requirements, UX and visual design, Next.js implementation, SEO, deployment, and ongoing maintenance have been managed since 2022 for a New Jersey and New York law-firm website. The site presents the firm’s services, jurisdiction, disclosures, and contact path.',
    facts: [
      {
        label: 'Client path',
        value: 'Service information and NJ/NY scope lead to a direct contact workflow with visible legal disclosures.',
      },
      {
        label: 'My responsibility',
        value: 'Requirements, information architecture, interface design, implementation, SEO, deployment, and maintenance.',
      },
      {
        label: 'Production safeguards',
        value: '16 KB request limit, server validation, honeypot, per-instance rate limit, generic errors, and Resend delivery.',
      },
    ],
    problem:
      'The site must help a prospective client understand the firm without implying that browsing or submitting a form creates an attorney-client relationship. Contact delivery also has to keep provider credentials server-side and return bounded information when validation or delivery fails.',
    decisions: [
      'Organize service information around the questions a prospective client needs answered before making contact.',
      'Keep attorney-advertising, privacy, and attorney-client disclosures visible in the public experience.',
      'Normalize and validate contact requests on the server while keeping provider credentials outside the client bundle.',
      'Bound the endpoint with a 16 KB request limit, honeypot, per-instance rate limit, and generic delivery errors.',
    ],
    state:
      'The maintained production site provides NJ/NY service information, visible disclosures, search metadata, and a server endpoint that sends validated contact requests through Resend.',
    note:
      'This case study describes the implemented workflow and safeguards. It does not claim measured search, acquisition, or conversion outcomes.',
    links: [
      { label: 'Visit live site', href: 'https://www.ryu-legal.com', external: true },
    ],
    next: { label: 'TROA', href: '/work/troa' },
  },
};

function Arrow({ external = false }: { external?: boolean }) {
  return <span aria-hidden="true">{external ? '↗' : '→'}</span>;
}

export default function CaseStudyZen({ project }: { project: ProjectId }) {
  const content = projects[project];

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#case-content">Skip to case study</a>

      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">
          <strong>Edward Song</strong>
          <span>Product Engineer · Technical Lead</span>
        </Link>
        <nav aria-label="Case study navigation">
          <Link href="/#work">All work</Link>
          <a href="/Resume-Edward_Song.pdf" target="_blank" rel="noreferrer">Résumé</a>
          <a href="mailto:edwardsong08@gmail.com">Email</a>
        </nav>
      </header>

      <main id="case-content">
        <section className={styles.hero} aria-labelledby="case-title">
          <div className={styles.heroCopy}>
            <Link className={styles.backLink} href="/#work">← Selected work</Link>
            <p className={styles.eyebrow}>{content.eyebrow}</p>
            <p className={styles.status}>{content.status}</p>
            <h1
              id="case-title"
              className={project === 'claimchain' ? styles.longTitle : undefined}
            >
              {content.title}
            </h1>
            <p className={styles.intro}>{content.intro}</p>
            <div className={styles.links}>
              {content.links.map((link) => (
                <a
                  href={link.href}
                  key={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noreferrer' : undefined}
                >
                  {link.label} <Arrow external={link.external} />
                </a>
              ))}
            </div>
          </div>
          <div className={styles.heroArtifact}>
            <ProjectEvidence project={project} priority />
          </div>
        </section>

        <section className={styles.evidence} aria-label="Case study evidence">
          <dl className={styles.facts}>
            {content.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.narrative}>
            <section>
              <p className={styles.sectionLabel}>The operating problem</p>
              <h2>What had to remain true</h2>
              <p>{content.problem}</p>
            </section>
            <section>
              <p className={styles.sectionLabel}>Decisions</p>
              <h2>How boundaries were placed</h2>
              <ol>
                {content.decisions.map((decision) => <li key={decision}>{decision}</li>)}
              </ol>
            </section>
          </div>

          <section className={styles.currentState}>
            <div>
              <p className={styles.sectionLabel}>Current state</p>
              <h2>What exists now</h2>
              <p>{content.state}</p>
            </div>
            <aside aria-label="Scope note">
              <strong>Scope note</strong>
              <p>{content.note}</p>
            </aside>
          </section>
        </section>

        <nav className={styles.moreWork} aria-label="More case studies">
          <Link href="/#work">← All selected work</Link>
          <Link href={content.next.href}>Next: {content.next.label} <Arrow /></Link>
        </nav>
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Edward Song</p>
        <div>
          <a href="mailto:edwardsong08@gmail.com">Email</a>
          <a href="https://www.linkedin.com/in/edward-y-song" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://github.com/edwardsong08" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
