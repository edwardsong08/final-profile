import Link from 'next/link';

import { ProjectEvidence } from './ProjectEvidence';
import styles from './CaseStudyZen.module.css';

export type ProjectId = 'troa' | 'claimchain' | 'ryu-legal';

type ProjectLink = {
  external?: boolean;
  href: string;
  label: string;
};

type ProjectSection = {
  heading: string;
  paragraphs?: string[];
  points?: Array<{
    body: string;
    title: string;
  }>;
};

const projects: Record<ProjectId, {
  eyebrow: string;
  facts: Array<{ label: string; value: string }>;
  intro: string;
  links: ProjectLink[];
  next: { href: string; label: string };
  note: string;
  sections: ProjectSection[];
  state: string;
  stateHeading: string;
  status: string;
  title: string;
}> = {
  troa: {
    eyebrow: 'TROA · Volunteer CTO · Active since 2026',
    status: 'Active',
    title: 'Building TROA’s technology function.',
    intro:
      'TROA’s technology mandate extends beyond shipping software: set direction with the board, turn departmental needs into a coherent portfolio, and build the team that can sustain it. The initial software foundation was built hands-on; the work now combines continued product engineering with leadership across software, design, Network Engineering, and IT Operations.',
    facts: [
      {
        label: 'Organization served',
        value: 'More than 50 volunteers and an 800-plus-member community, with technology supporting public programs and the people who operate them.',
      },
      {
        label: 'Portfolio',
        value: 'Public platform and identity, recruitment, learning, member support, administration and reporting, mapping, assistant, infrastructure, and game services.',
      },
      {
        label: 'Technology group',
        value: 'Two developers, two UI/UX designers, three to four network engineers, and two IT Operations specialists.',
      },
    ],
    sections: [
      {
        heading: 'A portfolio, not a collection of sites',
        paragraphs: [
          'Public services, volunteer recruitment, learning, member support, administration, reporting, and game services serve different audiences and carry different risks. The work is to give them a coherent foundation without forcing them into one application or one trust boundary.',
        ],
        points: [
          {
            title: 'Shared foundation',
            body: 'Identity, access patterns, content, and audit history connect the ecosystem where consistency reduces friction.',
          },
          {
            title: 'Purpose-built products',
            body: 'Each product keeps the workflow and interface its users need, from applicants and learners to members seeking support.',
          },
          {
            title: 'Private operations',
            body: 'Role-scoped tools give HR, finance, legal, IT, program, and support administrators direct control of recurring work.',
          },
        ],
      },
      {
        heading: 'An operating model for shared ownership',
        paragraphs: [
          'Technical leadership spans organizational direction and implementation. Board and departmental priorities are translated into scope, controls, and delivery decisions; hands-on product work continues while specialist teams own their disciplines.',
        ],
        points: [
          {
            title: 'Direction and tradeoffs',
            body: 'Set priorities with the board and resolve compliance, policy, timeline, capacity, and cross-department compromises before they become implementation problems.',
          },
          {
            title: 'Hands-on delivery',
            body: 'Remain hands-on from product and interface design through application architecture, data, security, deployment, and ongoing operation.',
          },
          {
            title: 'Specialist ownership',
            body: 'Network Engineering and IT Operations own specialist execution while remaining part of one accountable technology function.',
          },
        ],
      },
      {
        heading: 'Decisions that make the portfolio durable',
        points: [
          {
            title: 'One identity, several trust boundaries',
            body: 'Products share Supabase identity where appropriate, while privileged operations stay server-side and administrative areas remain separately authorized.',
          },
          {
            title: 'Operators should not need a developer for routine work',
            body: 'Admin workflows turn repeated requests into governed self-service for content, people, tickets, reporting, hiring, and learning.',
          },
          {
            title: 'Live state must survive change',
            body: 'Versioned course content, controlled publishing, private resources, and transactional revision workflows preserve the learner experience as training evolves.',
          },
        ],
      },
    ],
    stateHeading: 'The current phase',
    state:
      'The portfolio is active and expanding. The current phase is increasing engineering capacity and formalizing ownership, review, and delivery across the team, while the CTO role remains hands-on in product and engineering decisions.',
    note:
      'The public platform is shown here. Administrative, reporting, volunteer, and support tools contain private operational information and are described without exposing their interfaces or data.',
    links: [
      { label: 'Visit main site', href: 'https://therealmsofasgard.com', external: true },
    ],
    next: { label: 'ClaimChain', href: '/work/claimchain' },
  },
  claimchain: {
    eyebrow: 'ClaimChain · Independent product engineering · 2025–2026',
    status: 'Working prototype',
    title: 'A claims workflow with explicit authority.',
    intro:
      'ClaimChain tests a product premise: providers, administrators, and buyers should be able to move a claim from intake to purchase without treating interface state, payment redirects, or model output as proof. The working test-data prototype implements the complete path while keeping consequential decisions explicit, versioned, and enforceable.',
    facts: [
      {
        label: 'Product flow',
        value: 'Provider intake, administrator review and governed packaging, buyer purchase, and entitled export.',
      },
      {
        label: 'Governing principle',
        value: 'The backend remains authoritative for eligibility, lifecycle, payment state, ownership, and export access.',
      },
      {
        label: 'Evidence',
        value: 'A working three-role prototype with test payments, audit history, versioned rules, advisory ML, and an AWS staging workflow.',
      },
    ],
    sections: [
      {
        heading: 'The product question',
        paragraphs: [
          'The core difficulty is preserving eligibility, ownership, payment, and export rights when requests are retried, webhooks arrive later, and an advisory service may return an incomplete or incorrect suggestion.',
          'The product therefore treats authority as part of the user experience: every consequential state should have an explainable source and a bounded path to change.',
        ],
      },
      {
        heading: 'Where authority lives',
        points: [
          {
            title: 'Rules and human review',
            body: 'Versioned scoring and packaging rules establish eligibility and explain each result; administrators retain the approval and override responsibilities that require judgment.',
          },
          {
            title: 'Payment and entitlement',
            body: 'A browser redirect cannot mark inventory sold. Stripe webhook reconciliation establishes payment before the backend grants the buyer access to an export.',
          },
          {
            title: 'Machine learning',
            body: 'ML can propose package compositions only after deterministic eligibility checks. It cannot approve claims, bypass constraints, finalize a package, or grant access.',
          },
        ],
      },
      {
        heading: 'What the prototype proves',
        paragraphs: [
          'The implemented path connects account approval, structured claim intake, document handling, administrative review, explainable scoring, governed packaging, an anonymized buyer view, test purchase, audit activity, and entitled PDF export.',
        ],
        points: [
          {
            title: 'Explainable under change',
            body: 'Ruleset versions and recorded decisions make it possible to identify which policy produced a score or package after the rules evolve.',
          },
          {
            title: 'Safe degradation',
            body: 'The advisory layer can be unavailable without weakening the authoritative workflow or its deterministic fallback.',
          },
        ],
      },
    ],
    stateHeading: 'The boundary of the work',
    state:
      'ClaimChain is a working portfolio prototype, not an operating claims marketplace. It demonstrates the product flow and authority model; production operation would be a separate phase requiring domain validation, legal and compliance review, privacy controls, security hardening, and an operating organization.',
    note:
      'All portfolio material uses test data. The demo and repository are evidence of implementation, not evidence of commercial operation or production suitability.',
    links: [
      { label: 'View repository', href: 'https://github.com/edwardsong08/claimchain-platform', external: true },
      { label: 'Watch walkthrough', href: '/ClaimChain_Demo.mp4', external: true },
    ],
    next: { label: 'Ryu Legal', href: '/work/ryu-legal' },
  },
  'ryu-legal': {
    eyebrow: 'Ryu Legal · Contract engineering · 2022–now',
    status: 'Live and maintained',
    title: 'Long-term stewardship of a law firm’s public front door.',
    intro:
      'Since 2022, the engagement has grown from requirements and interface design into ongoing stewardship of a live production experience. The product has a clear responsibility: help prospective clients understand the firm, its NJ/NY scope, and the next step without overstating what a website visit or inquiry means.',
    facts: [
      {
        label: 'Relationship',
        value: 'An ongoing engagement from initial product definition and design through production maintenance and continued refinement.',
      },
      {
        label: 'Responsibility',
        value: 'Requirements, information architecture, interface design, engineering, search visibility, deployment, and maintenance.',
      },
      {
        label: 'Product standard',
        value: 'Clear service information, visible legal boundaries, a direct contact path, and restrained handling of production failures.',
      },
    ],
    sections: [
      {
        heading: 'The product problem',
        paragraphs: [
          'A law-firm website has to make a professional service understandable while preserving appropriate expectations. Prospective clients need enough context to decide whether to make contact; the interface should not imply that browsing, submitting a form, or reading general information creates an attorney-client relationship.',
        ],
      },
      {
        heading: 'Trust is part of the interface',
        points: [
          {
            title: 'Organize around client questions',
            body: 'Service information and NJ/NY scope are structured around what a prospective client needs to understand before deciding to contact the firm.',
          },
          {
            title: 'Keep legal boundaries visible',
            body: 'Attorney-advertising, privacy, and attorney-client disclosures remain part of the public experience rather than being treated as an afterthought.',
          },
          {
            title: 'Make contact direct but bounded',
            body: 'The form creates a clear handoff to the firm while server-side validation, protected provider credentials, and restrained error responses limit unnecessary exposure.',
          },
        ],
      },
      {
        heading: 'Stewardship after launch',
        paragraphs: [
          'The engagement did not end at deployment. Ongoing work keeps the experience coherent as content, design expectations, search requirements, dependencies, and production safeguards change.',
        ],
        points: [
          {
            title: 'Product continuity',
            body: 'Requirements, design, implementation, and maintenance remain connected so product decisions stay aligned as the live site evolves.',
          },
          {
            title: 'Discoverability and performance',
            body: 'Search metadata, responsive presentation, dependency maintenance, and production verification are treated as part of the product rather than launch tasks.',
          },
          {
            title: 'Proportionate safeguards',
            body: 'The contact endpoint normalizes and validates input, limits abuse and request size, keeps delivery credentials server-side, and fails without disclosing provider details.',
          },
        ],
      },
    ],
    stateHeading: 'Current state',
    state:
      'The site is live and maintained. Its current version combines a responsive service presentation, visible legal disclosures, search metadata, and server-validated contact delivery in a production experience that continues to evolve with the firm.',
    note:
      'The case study is limited to the public experience and implemented safeguards; no client data or contact submissions are shown.',
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
            <h1 id="case-title">
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
            <ProjectEvidence
              project={project}
              priority
              claimchainView={project === 'claimchain' ? 'diagram' : undefined}
            />
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

          <div className={styles.story}>
            {content.sections.map((section) => (
              <section className={styles.storySection} key={section.heading}>
                <h2>{section.heading}</h2>
                <div className={styles.storyBody}>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.points ? (
                    <dl className={styles.storyPoints}>
                      {section.points.map((point) => (
                        <div key={point.title}>
                          <dt>{point.title}</dt>
                          <dd>{point.body}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </div>
              </section>
            ))}
          </div>

          <section className={styles.currentState}>
            <div>
              <h2>{content.stateHeading}</h2>
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
