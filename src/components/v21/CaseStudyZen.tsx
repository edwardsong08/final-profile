import Link from 'next/link';

import { ClaimChainEvidence, ProjectEvidence } from './ProjectEvidence';
import styles from './CaseStudyZen.module.css';

type ProjectId = 'troa' | 'claimchain' | 'ryu-legal' | 'hub';
type StorySection = { title: string; paragraphs?: readonly string[]; points?: readonly { label: string; value: string }[] };
type Project = {
  eyebrow: string; status: string; title: string; intro: string;
  facts: readonly { label: string; value: string }[];
  links: readonly { label: string; href: string; external?: boolean }[];
  sections: readonly StorySection[];
  currentState: { title: string; body: string; scope: string };
  next: { label: string; href: string };
};

const projects: Record<ProjectId, Project> = {
  troa: {
    eyebrow: 'TROA · Software Engineer to CTO · Active',
    status: 'Volunteer technology leadership',
    title: 'Building TROA’s technology function.',
    intro: 'I grew from hands-on software delivery into organization-wide technology leadership, while continuing to design, build, and operate the systems behind a 50-plus-person volunteer organization and an 800-plus-member community.',
    facts: [
      { label: 'Scale', value: 'Technology supporting 50+ volunteers and an 800+ member community.' },
      { label: 'Operating footprint', value: 'Public, recruiting, learning, ticketing, administrative, gaming, automation, and infrastructure systems.' },
      { label: 'Leadership scope', value: 'Product design, software development, data, network engineering, and IT operations.' },
    ],
    links: [
      { label: 'Visit TROA', href: 'https://therealmsofasgard.com', external: true },
      { label: 'Explore the live map', href: 'https://troa-realms.therealmsofasgard.com/map', external: true },
    ],
    sections: [
      {
        title: 'From builder to technology leader',
        paragraphs: [
          'I joined the work as a software engineer, became senior software engineer and interim CTO, and now serve as CTO. That progression matters because the leadership is grounded in direct delivery: until the team began expanding, I built nearly all of the organization’s software myself.',
          'Today I set direction at the board level, translate operating needs into technical priorities, and coordinate specialists across five disciplines without stepping away from architecture and implementation.',
        ],
      },
      {
        title: 'One portfolio, different trust boundaries',
        paragraphs: ['TROA is not one website. Its technology portfolio spans a public platform, careers and applications, staff administration, ticketing, learning, community automation, game services, and private operational tools. Each surface serves a different audience and requires a different balance of access, clarity, and control.'],
        points: [
          { label: 'Public experience', value: 'Community information, programs, careers, and pathways into the organization.' },
          { label: 'Internal operations', value: 'Administrative workflows, shared-drive systems, training, tickets, backups, and governed access.' },
          { label: 'Community systems', value: 'Discord automation, volunteer-response rooms, game infrastructure, and a navigable Space Engineers world map.' },
        ],
      },
      {
        title: 'Infrastructure as an operating advantage',
        paragraphs: [
          'The portfolio runs on an increasingly self-hosted foundation using Proxmox, Linux, Docker, Coolify, and Cloudflare. Multiple servers support production services, backups, and game workloads, while selected open-source platforms replace fragmented third-party tools.',
          'The objective is not self-hosting for its own sake. It is to keep operating costs controlled, data boundaries understandable, recovery paths available, and performance appropriate for each service.',
        ],
      },
      {
        title: 'Making the work repeatable',
        paragraphs: ['A sustainable technology function needs more than working software. I created operating procedures, clarified ownership, established safer delivery practices, and built AI-assisted administrative systems for work such as document and shared-drive operations.'],
        points: [
          { label: 'Products', value: 'A connected portfolio rather than isolated sites and tools.' },
          { label: 'People', value: 'Defined teams and ownership across product, engineering, data, network, and IT operations.' },
          { label: 'Practice', value: 'SOPs, backups, security controls, deployment workflows, and maintainable handoffs.' },
        ],
      },
    ],
    currentState: {
      title: 'The work is moving from founder-style delivery to a durable technology organization.',
      body: 'The current phase is about increasing team capacity, formalizing ownership, and improving reliability without slowing delivery. I remain accountable for direction and architecture while transferring more implementation responsibility to the growing team.',
      scope: 'This page shows public products and describes private operations at a systems level. Administrative interfaces, internal data, security details, and volunteer records are intentionally excluded.',
    },
    next: { label: 'Next: Ryu Legal', href: '/work/ryu-legal' },
  },
  'ryu-legal': {
    eyebrow: 'Ryu Legal · Technical Lead · Contract since 2022',
    status: 'Live and continuously maintained',
    title: 'Owning technology for a growing legal practice.',
    intro: 'What began as a public website became a long-term technology engagement spanning growth, custom software, hosting, networking, security, performance, DevOps, open-source tooling, and the reliable operation of the firm’s digital systems.',
    facts: [
      { label: 'Measured result', value: '30%+ increase in website-originated client contact following search and site improvements.' },
      { label: 'Responsibility', value: 'Product, software, infrastructure, security, performance, deployment, and ongoing operations.' },
      { label: 'Operating model', value: 'Most third-party operational services moved to a controlled, backed-up in-house stack.' },
    ],
    links: [{ label: 'Visit Ryu Legal', href: 'https://www.ryu-legal.com', external: true }],
    sections: [
      {
        title: 'From website project to technical ownership',
        paragraphs: [
          'The initial brief centered on the firm’s public presence. The responsibility expanded as the practice needed someone to connect product decisions with the systems underneath them: hosting, networking, security, deployment, performance, maintenance, and custom operational software.',
          'That continuity prevents the common handoff gap between a site that looks finished and a technology estate that remains dependable after launch.',
        ],
      },
      {
        title: 'Growth built on clarity and trust',
        paragraphs: [
          'Legal services require people to understand what the firm does, where it practices, and how to ask for help without being pushed through an overdesigned funnel. I reworked information architecture, interface content, technical performance, and search visibility around those decisions.',
          'The resulting search and site improvements contributed to a reported increase of more than 30 percent in client contact originating through the website.',
        ],
        points: [
          { label: 'Findability', value: 'Technical and content-led SEO aligned to actual services and locations.' },
          { label: 'Confidence', value: 'A restrained interface, clear practice information, and direct contact paths.' },
          { label: 'Continuity', value: 'Performance, deployment, monitoring, and maintenance treated as ongoing product work.' },
        ],
      },
      {
        title: 'Bringing the operating stack in house',
        paragraphs: [
          'I consolidated much of the firm’s technology onto an in-house environment built with Proxmox, Linux, Docker, Coolify, and Cloudflare. The stack is designed around controlled access, backups, fast recovery, predictable performance, and fewer unnecessary recurring vendors.',
          'Connectivity, electricity, domains, and email remain external necessities; most other operational services are owned and managed directly.',
        ],
      },
      {
        title: 'Stewardship after launch',
        paragraphs: ['The work continues across custom software, open-source tools, infrastructure changes, security, and day-to-day technical decisions. I evaluate each addition against the same standard: does it make the practice more capable without making its systems harder to understand, secure, or maintain?'],
      },
    ],
    currentState: {
      title: 'This is an active contract and an operating environment, not a finished redesign.',
      body: 'The public site is one visible layer of a broader technology relationship. Current work centers on reliability, security, performance, internal capability, and incremental software improvements as the firm’s needs evolve.',
      scope: 'Client matters, internal workflows, private software, infrastructure topology, credentials, and security-sensitive implementation details are not shown. Outcomes and responsibilities are described without exposing protected systems.',
    },
    next: { label: 'Next: The Hub', href: '/work/hub' },
  },
  claimchain: {
    eyebrow: 'ClaimChain · Product Lead · 2021–2023',
    status: 'Early-stage legal technology prototype',
    title: 'Testing authority in a claims marketplace.',
    intro: 'ClaimChain explored whether providers, administrators, and buyers could move a claim through review, valuation support, purchase, and controlled document release without blurring who had authority at each step.',
    facts: [
      { label: 'Product model', value: 'Three roles with deliberately different actions, visibility, and document rights.' },
      { label: 'Technical principle', value: 'Backend-enforced authority with advisory scoring kept separate from business decisions.' },
      { label: 'Current form', value: 'A self-hosted portfolio demonstration and public source repository, not an operating marketplace.' },
    ],
    links: [
      { label: 'Watch the workflow demo', href: '#demo' },
      { label: 'Open the demo', href: 'https://claimchain.edsong.xyz', external: true },
      { label: 'View repository', href: 'https://github.com/edwardsong08/claimchain-platform', external: true },
    ],
    sections: [
      {
        title: 'Start with authority, not screens',
        paragraphs: [
          'The core product problem was not a dashboard layout. It was deciding which role could change claim state, inspect documents, set marketplace terms, complete a test purchase, and receive an entitled export.',
          'The prototype made those rules explicit in backend workflows so the interface could explain authority rather than manufacture it.',
        ],
        points: [
          { label: 'Provider', value: 'Submits a claim and supporting documents, then follows its review state.' },
          { label: 'Administrator', value: 'Reviews evidence, uses advisory scoring, and prepares an approved listing.' },
          { label: 'Buyer', value: 'Tests a purchase flow and receives only the documents attached to that entitlement.' },
        ],
      },
      {
        title: 'Keep automation advisory',
        paragraphs: [
          'A scoring workflow can organize evidence and support review, but it should not quietly become the source of truth. ClaimChain kept model output advisory and left consequential state changes with authorized users.',
          'That boundary made the product easier to reason about and reduced the temptation to present probabilistic output as a legal or financial decision.',
        ],
      },
      {
        title: 'Prototype the full handoff',
        paragraphs: ['The most useful test was the complete sequence: submission, administrative review, listing, test payment, entitlement creation, and controlled export. Building the handoff exposed product questions that isolated screens would have hidden.'],
      },
    ],
    currentState: {
      title: 'The startup did not progress to commercial scale.',
      body: 'The work remains useful as an honest product and engineering case study: a functioning prototype that tests roles, workflow authority, payments, and document access without presenting itself as a live claims marketplace.',
      scope: 'The public demo uses test workflows and demonstration data. It does not offer financial products, legal advice, production transactions, or live claim purchasing.',
    },
    next: { label: 'Next: TROA', href: '/work/troa' },
  },
  hub: {
    eyebrow: 'ES/HUB · Systems map · Active',
    status: 'Living portfolio architecture',
    title: 'Making complex work understandable.',
    intro: 'The Hub is an interactive model of my projects, infrastructure, services, and responsibilities. It replaces a flat directory with a navigable system that shows what belongs together, what connects across boundaries, and what is safe to expose publicly.',
    facts: [
      { label: 'Two views', value: 'A spatial Map for relationships and an Index for direct, accessible retrieval.' },
      { label: 'Information model', value: 'Hierarchy, associations, lifecycle, visibility, and operational status remain distinct.' },
      { label: 'Public boundary', value: 'Useful system context without credentials, private data, or sensitive infrastructure detail.' },
    ],
    links: [{ label: 'Explore the Hub', href: 'https://hub.edsong.xyz', external: true }],
    sections: [
      {
        title: 'A portfolio list could not show the system',
        paragraphs: [
          'A conventional portfolio grid treats every project as an isolated object. That stopped being useful once the same infrastructure, services, organizations, and operating responsibilities began supporting multiple products.',
          'The Hub provides a stable overview first, then lets a visitor move into a territory and inspect only the level of detail needed for the current question.',
        ],
      },
      {
        title: 'Model the meaning before drawing the map',
        paragraphs: ['The visual network is generated from an information model rather than arranged as decoration. Each property answers a different question, which prevents organizational convenience from becoming misleading architecture.'],
        points: [
          { label: 'Hierarchy', value: 'Where an item belongs and which territory owns it.' },
          { label: 'Associations', value: 'Meaningful relationships that cross the hierarchy without duplicating ownership.' },
          { label: 'Lifecycle', value: 'Whether work is active, evolving, paused, archived, or historical.' },
          { label: 'Visibility', value: 'What may be public, public-safe, private, or intentionally omitted.' },
          { label: 'Status', value: 'Operational state kept separate from project maturity or importance.' },
        ],
      },
      {
        title: 'Offer exploration without requiring it',
        paragraphs: [
          'The Map supports spatial exploration and reveals relationships progressively. The Index presents the same underlying system as a direct, scannable structure. Neither view is a secondary fallback; they are two interfaces for different ways of finding information.',
          'Node cards add context only after selection, keeping the overview legible while still allowing leaf-level details, links, and public-safe operational notes.',
        ],
      },
      {
        title: 'Treat omission as part of the design',
        paragraphs: ['The Hub describes systems without becoming a blueprint for private operations. Sensitive services can be represented by purpose and relationship while credentials, internal addresses, private records, and security-relevant implementation details remain outside the public graph.'],
      },
    ],
    currentState: {
      title: 'The Hub is active and continues to evolve with the work it represents.',
      body: 'Its current role is both practical and demonstrative: a public entry point into the portfolio and a case study in taxonomy, progressive disclosure, systems visualization, and maintainable information architecture.',
      scope: 'The public Hub intentionally favors comprehensibility over exhaustive infrastructure detail. Catalog status is descriptive and should not be interpreted as live monitoring unless a node explicitly says otherwise.',
    },
    next: { label: 'Next: ClaimChain', href: '/work/claimchain' },
  },
};

function Arrow({ external = false }: { external?: boolean }) {
  return <span aria-hidden="true">{external ? '↗' : '→'}</span>;
}

function HubCaseEvidence() {
  return (
    <figure className={styles.hubArtifact}>
      <div className={styles.hubArtifactHeader}>
        <span>ES/HUB systems map</span>
        <strong>Map · Index</strong>
      </div>
      <iframe
        src={process.env.NODE_ENV === 'development'
          ? 'http://localhost:3001/embed/profile'
          : 'https://hub.edsong.xyz/embed/profile'}
        title="Interactive ES/HUB systems map"
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </figure>
  );
}

export default function CaseStudyZen({ project: projectId }: { project: ProjectId }) {
  const project = projects[projectId];
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#case-study">Skip to case study</a>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/"><strong>Edward Song</strong><span>CTO · Technical Lead · Product Engineer</span></Link>
        <nav aria-label="Case study navigation"><Link href="/#work">Selected work</Link><a href="/Resume-Edward_Song.pdf" target="_blank" rel="noreferrer">Résumé</a><a href="mailto:edwardsong08@gmail.com">Email</a></nav>
      </header>
      <main id="case-study">
        <section className={styles.hero} aria-labelledby="case-title">
          <div className={styles.heroCopy}>
            <Link className={styles.backLink} href="/#work">← Back to selected work</Link>
            <p className={styles.eyebrow}>{project.eyebrow}</p><p className={styles.status}>{project.status}</p>
            <h1 id="case-title">{project.title}</h1><p className={styles.intro}>{project.intro}</p>
            <div className={styles.links}>{project.links.map(link => <a key={link.href} href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>{link.label} <Arrow external={link.external} /></a>)}</div>
          </div>
          <div className={styles.heroArtifact} id={projectId === 'claimchain' ? 'demo' : undefined}>
            {projectId === 'hub'
              ? <HubCaseEvidence />
              : <ProjectEvidence project={projectId} priority claimchainView={projectId === 'claimchain' ? 'demo' : undefined} />}
          </div>
        </section>
        <section className={styles.evidence} aria-label="Case study evidence and narrative">
          <p className={styles.evidenceLabel}>At a glance</p>
          <dl className={styles.facts}>{project.facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
          <div className={styles.story}>
            {project.sections.map((section, index) => <section className={styles.storySection} key={section.title}>
              <div className={styles.storyHeading}><p>{String(index + 1).padStart(2, '0')}</p><h2>{section.title}</h2></div>
              <div className={styles.storyBody}>
                {section.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                {section.points && <dl className={styles.storyPoints}>{section.points.map(point => <div key={point.label}><dt>{point.label}</dt><dd>{point.value}</dd></div>)}</dl>}
                {projectId === 'claimchain' && index === 0 && <div className={styles.storyEvidence}><ClaimChainEvidence view="diagram" /></div>}
              </div>
            </section>)}
          </div>
          <section className={styles.currentState}><div><p className={styles.evidenceLabel}>Current state</p><h2>{project.currentState.title}</h2><p>{project.currentState.body}</p></div><aside><strong>Scope note</strong><p>{project.currentState.scope}</p></aside></section>
        </section>
      </main>
      <nav className={styles.moreWork} aria-label="More work"><Link href="/#work">All selected work <Arrow /></Link><Link href={project.next.href}>{project.next.label} <Arrow /></Link></nav>
      <footer className={styles.footer}><p>Edward Song · Pennsylvania</p><div><a href="mailto:edwardsong08@gmail.com">Email</a><a href="https://github.com/edwardsong08" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.linkedin.com/in/edward-y-song" target="_blank" rel="noreferrer">LinkedIn</a></div></footer>
    </div>
  );
}
