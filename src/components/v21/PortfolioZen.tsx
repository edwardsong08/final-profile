import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { ProjectEvidence, type TroaSlideId } from './ProjectEvidence';
import SmokeField from './SmokeField';
import styles from './PortfolioZen.module.css';

const EMAIL = 'edwardsong08@gmail.com';

const capabilities = [
  {
    annotation: 'Applied across',
    title: 'Product and systems direction',
    description:
      'Define workflows and scope with users, department leads, and executives.',
    evidence: 'TROA · ClaimChain · Ryu Legal',
  },
  {
    annotation: 'Selected stack',
    title: 'Application engineering',
    description:
      'Build and maintain interfaces, services, data models, integrations, and deployments.',
    evidence: 'Next.js · Laravel · Spring Boot · PostgreSQL',
  },
  {
    annotation: 'Controls',
    title: 'Security and operational controls',
    description:
      'Turn compliance and policy into permissions, validation, server authority, and audit history.',
    evidence: 'RBAC · RLS · validation · audit trails',
  },
  {
    annotation: 'Environments',
    title: 'Delivery and operations',
    description:
      'Set production standards across cloud, on-premises, and vendor services.',
    evidence: 'AWS · Cloudflare · containers · CI/CD',
  },
  {
    annotation: 'Leadership scope',
    title: 'Technical leadership',
    description:
      'Set direction and lead delivery across software, UI/UX, network engineering, and IT operations.',
    evidence: 'Board collaboration · team direction · compliance',
  },
];

const experience = [
  {
    dates: '2026–now',
    role: 'Chief Technology Officer (Volunteer)',
    organization: 'The Realms of Asgard',
  },
  {
    dates: '2022–now',
    role: 'Software Engineer',
    organization: 'Ryu Legal + client work',
  },
  {
    dates: '2021–2023',
    role: 'Product Engineer',
    organization: 'Legal startup',
  },
];

const projects = [
  { id: 'project-troa', label: 'TROA' },
  { id: 'project-claimchain', label: 'ClaimChain' },
  { id: 'project-ryu', label: 'Ryu Legal' },
] as const;

const primarySections = [
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const;

const projectIds = projects.map((project) => project.id);
type ProjectId = (typeof projectIds)[number];
const primarySectionIds = primarySections.map((section) => section.id);

const troaSlideNarratives: Record<TroaSlideId, {
  facts: Array<{ label: string; value: string }>;
  heading: string;
  summary: string;
}> = {
  'public-platform': {
    heading: 'Public platform',
    summary:
      'A shared public entry point for TROA’s services, volunteer programs, advocacy, and community.',
    facts: [
      {
        label: 'Responsibility',
        value: 'Product direction and delivery from information architecture through deployment.',
      },
      {
        label: 'Design choice',
        value: 'One accessible content structure connects the ecosystem without flattening its distinct programs.',
      },
    ],
  },
  careers: {
    heading: 'Volunteer recruitment',
    summary:
      'A dedicated recruitment path gives candidates context, a focused application flow, and visibility after submission.',
    facts: [
      {
        label: 'Candidate path',
        value: 'Role discovery, application, confirmation, and applicant progress.',
      },
      {
        label: 'Operating boundary',
        value: 'Public applications connect to role-gated review and administration.',
      },
    ],
  },
  ticketing: {
    heading: 'Member support',
    summary:
      'A single request path helps members seek support while giving staff a structured record from intake through resolution.',
    facts: [
      {
        label: 'Member experience',
        value: 'Focused intake and clear status through resolution.',
      },
      {
        label: 'Staff workflow',
        value: 'Role-aware handling, relevant context, and accountable records.',
      },
    ],
  },
  'learning-center': {
    heading: 'Training and development',
    summary:
      'Structured training, progress, and credentials connect learning with volunteer onboarding and organizational requirements.',
    facts: [
      {
        label: 'Learner path',
        value: 'Courses, progress, completion, and learning records.',
      },
      {
        label: 'Operating boundary',
        value: 'Learner records remain within the broader identity and access model.',
      },
    ],
  },
  'private-operations': {
    heading: 'Private operations',
    summary:
      'Internal systems support people, finance, legal, IT, reporting, support, and governance without exposing private interfaces or operational data.',
    facts: [
      {
        label: 'Operator experience',
        value: 'Purpose-built workflows let non-engineer administrators manage recurring work.',
      },
      {
        label: 'Control model',
        value: 'Shared identity, role-scoped access, server-side privileges, separate trust boundaries, and audit history.',
      },
    ],
  },
};

function Arrow({ external = false }: { external?: boolean }) {
  return (
    <span aria-hidden="true" className={styles.linkArrow}>
      {external ? '↗' : '→'}
    </span>
  );
}

function ScrollProgress() {
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      progressRef.current?.style.setProperty('transform', `scaleX(${progress})`);
      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return <span ref={progressRef} className={styles.progressValue} aria-hidden="true" />;
}

function useActiveSection(
  sectionIds: readonly string[],
  viewportAnchor: number,
  activateBeforeFirst = true,
) {
  const [activeSection, setActiveSection] = useState(
    activateBeforeFirst ? sectionIds[0] : '',
  );

  useEffect(() => {
    let animationFrame = 0;
    let disposed = false;

    const update = () => {
      const anchor = window.innerHeight * viewportAnchor;
      let nextSection = activateBeforeFirst ? sectionIds[0] : '';

      for (const sectionId of sectionIds) {
        const section = document.getElementById(sectionId);
        if (!section) continue;

        if (section.getBoundingClientRect().top <= anchor) {
          nextSection = sectionId;
        } else {
          break;
        }
      }

      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        nextSection = sectionIds.at(-1) ?? nextSection;
      }

      setActiveSection((currentSection) =>
        currentSection === nextSection ? currentSection : nextSection,
      );
      animationFrame = 0;
    };

    const requestUpdate = () => {
      if (disposed || animationFrame) return;
      animationFrame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('hashchange', requestUpdate);
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('scroll', requestUpdate, { passive: true });
    void document.fonts?.ready.then(requestUpdate);

    return () => {
      disposed = true;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('hashchange', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      window.removeEventListener('scroll', requestUpdate);
    };
  }, [activateBeforeFirst, sectionIds, viewportAnchor]);

  return [activeSection, setActiveSection] as const;
}

function WorkIndex() {
  const [activeProject, setActiveProject] = useActiveSection(projectIds, 0.36);
  const indexRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const index = indexRef.current;
    const activeLink = linkRefs.current[activeProject];
    if (!index || !activeLink) return;

    const positionIndicator = () => {
      const indexBounds = index.getBoundingClientRect();
      const linkBounds = activeLink.getBoundingClientRect();
      index.style.setProperty('--work-indicator-x', `${linkBounds.left - indexBounds.left}px`);
      index.style.setProperty('--work-indicator-width', `${linkBounds.width}px`);
    };

    positionIndicator();
    const resizeObserver = new ResizeObserver(positionIndicator);
    resizeObserver.observe(index);
    const readyFrame = window.requestAnimationFrame(() => {
      index.dataset.indicatorReady = 'true';
    });

    return () => {
      window.cancelAnimationFrame(readyFrame);
      resizeObserver.disconnect();
    };
  }, [activeProject]);

  return (
    <nav className={styles.workIndex} aria-label="Selected project index">
      <ul ref={indexRef}>
        {projects.map((project) => (
          <li key={project.id}>
            <a
              ref={(link) => {
                linkRefs.current[project.id] = link;
              }}
              href={`#${project.id}`}
              aria-current={activeProject === project.id ? 'location' : undefined}
              onClick={() => setActiveProject(project.id)}
            >
              {project.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function MobileWorkSelector({
  activeProject,
  onSelect,
}: {
  activeProject: ProjectId;
  onSelect: (projectId: ProjectId) => void;
}) {
  return (
    <nav className={styles.mobileWorkSelector} aria-label="Choose a selected project">
      {projects.map((project) => (
        <button
          type="button"
          key={project.id}
          aria-pressed={activeProject === project.id}
          onClick={() => onSelect(project.id)}
        >
          {project.label}
        </button>
      ))}
    </nav>
  );
}

function PrimaryNavigation({
  activeSection,
  onActiveSectionChange,
}: {
  activeSection: string;
  onActiveSectionChange: (sectionId: string) => void;
}) {
  const [isMobileIndexOpen, setIsMobileIndexOpen] = useState(false);
  const mobileIndexToggleRef = useRef<HTMLButtonElement>(null);
  const activeSectionLabel = primarySections.find(
    (section) => section.id === activeSection,
  )?.label ?? 'Work';

  useEffect(() => {
    if (!isMobileIndexOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsMobileIndexOpen(false);
      window.requestAnimationFrame(() => mobileIndexToggleRef.current?.focus());
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMobileIndexOpen]);

  const navigateToSection = (sectionId: string) => {
    onActiveSectionChange(sectionId);
    if (isMobileIndexOpen) {
      window.requestAnimationFrame(() => mobileIndexToggleRef.current?.focus({ preventScroll: true }));
    }
    setIsMobileIndexOpen(false);
  };

  const closeMobileIndex = () => {
    setIsMobileIndexOpen(false);
    window.requestAnimationFrame(() => mobileIndexToggleRef.current?.focus({ preventScroll: true }));
  };

  return (
    <nav className={styles.stickyNav} aria-label="Primary navigation">
      <div className={`${styles.navInner} ${styles.desktopNavigation}`}>
        <a className={styles.navName} href="#top" aria-label="Edward Song, back to top">
          ES
        </a>
        <ul>
          {primarySections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={activeSection === section.id ? 'location' : undefined}
                onClick={() => navigateToSection(section.id)}
              >
                {section.label}
              </a>
            </li>
          ))}
          <li>
            <a href="/Resume-Edward_Song.pdf" target="_blank" rel="noreferrer">
              Résumé
            </a>
          </li>
        </ul>
      </div>

      <div className={styles.mobileNavigation}>
        <a className={styles.navName} href="#top" aria-label="Edward Song, back to top">
          ES
        </a>
        <span className={styles.mobileCurrentSection} aria-live="polite">
          {activeSectionLabel}
        </span>
        <button
          ref={mobileIndexToggleRef}
          className={styles.mobileIndexToggle}
          type="button"
          aria-controls="mobile-section-index"
          aria-expanded={isMobileIndexOpen}
          onClick={() => setIsMobileIndexOpen((isOpen) => !isOpen)}
        >
          <span>Index</span>
          <span aria-hidden="true">{isMobileIndexOpen ? '−' : '+'}</span>
        </button>
      </div>

      <div
        id="mobile-section-index"
        className={styles.mobileSectionIndex}
        data-open={isMobileIndexOpen ? 'true' : 'false'}
        aria-hidden={isMobileIndexOpen ? undefined : 'true'}
      >
        <ul>
          {primarySections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={activeSection === section.id ? 'location' : undefined}
                onClick={() => navigateToSection(section.id)}
              >
                <span>{section.label}</span>
                <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
          <li>
            <a
              href="/Resume-Edward_Song.pdf"
              target="_blank"
              rel="noreferrer"
              onClick={closeMobileIndex}
            >
              <span>Résumé</span>
              <span aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </div>
      <span className={styles.progressTrack} aria-hidden="true">
        <ScrollProgress />
      </span>
    </nav>
  );
}

export default function PortfolioZen() {
  const [activeTroaSlide, setActiveTroaSlide] = useState<TroaSlideId>('public-platform');
  const [activeMobileProject, setActiveMobileProject] = useState<ProjectId>('project-troa');
  const [activePrimarySection, setActivePrimarySection] = useActiveSection(
    primarySectionIds,
    0.32,
    false,
  );
  const troaNarrative = troaSlideNarratives[activeTroaSlide];

  useEffect(() => {
    const syncProjectFromHash = () => {
      if (!window.matchMedia('(max-width: 51.25rem)').matches) return;
      const projectId = window.location.hash.slice(1) as ProjectId;
      if (!projectIds.includes(projectId)) return;
      setActiveMobileProject(projectId);
      window.requestAnimationFrame(() => {
        document.getElementById(projectId)?.scrollIntoView({ block: 'start' });
      });
    };

    const initialSyncFrame = window.requestAnimationFrame(syncProjectFromHash);
    window.addEventListener('hashchange', syncProjectFromHash);
    return () => {
      window.cancelAnimationFrame(initialSyncFrame);
      window.removeEventListener('hashchange', syncProjectFromHash);
    };
  }, []);

  const selectMobileProject = (projectId: ProjectId) => {
    setActiveMobileProject(projectId);
    window.history.replaceState(null, '', `#${projectId}`);
    window.requestAnimationFrame(() => {
      document.getElementById(projectId)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  };

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#work">
        Skip to selected work
      </a>

      <header id="top" className={styles.hero}>
        <SmokeField />

        <div className={styles.heroFrame}>
          <div className={styles.heroIdentity}>
            <p className={styles.name}>Edward Song</p>
          </div>

          <div className={styles.heroRole}>
            <h1>
              Product Engineer{' '}
              <span>Technical Lead</span>
            </h1>
            <p className={styles.quietLabel}>Northern New Jersey</p>
          </div>

            <div className={styles.heroIntro}>
            <p className={styles.heroKicker}>Current work · Volunteer CTO at TROA</p>
            <p className={styles.heroSummary}>
              Setting technical direction with the board while remaining hands-on in product
              engineering and leading teams across software, UI/UX, network engineering, and IT
              operations.
            </p>
          </div>

          <div className={styles.heroActions} aria-label="Introduction links">
            <a className={styles.primaryLink} href="#work">
              See selected work <Arrow />
            </a>
            <a href="/Resume-Edward_Song.pdf" target="_blank" rel="noreferrer">
              View résumé <Arrow external />
            </a>
            <a href={`mailto:${EMAIL}`}>
              Email <Arrow external />
            </a>
          </div>

        </div>
      </header>

      <PrimaryNavigation
        activeSection={activePrimarySection}
        onActiveSectionChange={setActivePrimarySection}
      />

      <main>
        <section
          id="work"
          className={`${styles.section} ${styles.workSection} ${styles.traceSection}`}
          aria-labelledby="work-title"
          data-trace-active={activePrimarySection === 'work' ? 'true' : 'false'}
        >
          <div className={styles.sectionHeading}>
            <h2 id="work-title" className={styles.traceTitle}>
              Selected work
            </h2>
          </div>

          <WorkIndex />
          <MobileWorkSelector
            activeProject={activeMobileProject}
            onSelect={selectMobileProject}
          />

          <div className={styles.projectList}>
            <article
              id="project-troa"
              className={`${styles.project} ${styles.troaProject}`}
              aria-labelledby="troa-title"
              data-mobile-active={activeMobileProject === 'project-troa' ? 'true' : 'false'}
            >
              <div className={styles.projectMedia}>
                <ProjectEvidence
                  project="troa"
                  onTroaSlideChange={setActiveTroaSlide}
                />
              </div>

              <div className={styles.projectCopy}>
                <div className={styles.projectNarrative}>
                  <p className={styles.projectMeta}>Volunteer CTO · Active since 2026</p>
                  <h3 id="troa-title">TROA</h3>
                  <p className={styles.projectLead}>
                    TROA’s technology supports more than 50 volunteers and a community of more than
                    800 members. The CTO role combines board-level direction, product engineering,
                    and leadership of a multidisciplinary team.
                  </p>
                </div>
                <div
                  className={styles.troaSlideNarrative}
                >
                  {(Object.entries(troaSlideNarratives) as Array<[
                    TroaSlideId,
                    (typeof troaSlideNarratives)[TroaSlideId],
                  ]>).map(([slideId, narrative]) => {
                    const isActive = slideId === activeTroaSlide;

                    return (
                      <div
                        className={styles.troaNarrativePanel}
                        data-active={isActive ? 'true' : 'false'}
                        aria-hidden={isActive ? undefined : 'true'}
                        key={slideId}
                      >
                        <h4>{narrative.heading}</h4>
                        <p>{narrative.summary}</p>
                        <dl className={styles.projectFacts}>
                          {narrative.facts.map((fact) => (
                            <div key={fact.label}>
                              <dt>{fact.label}</dt>
                              <dd>{fact.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    );
                  })}
                  <span
                    className={styles.visuallyHidden}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {troaNarrative.heading}. {troaNarrative.summary}
                  </span>
                </div>
                <div className={styles.projectLinks}>
                  <Link href="/work/troa">
                    Read case study <Arrow />
                  </Link>
                  <a href="https://therealmsofasgard.com" target="_blank" rel="noreferrer">
                    Visit main site <Arrow external />
                  </a>
                </div>
              </div>
            </article>

            <article
              id="project-claimchain"
              className={`${styles.project} ${styles.projectReverse}`}
              aria-labelledby="claimchain-title"
              data-mobile-active={activeMobileProject === 'project-claimchain' ? 'true' : 'false'}
            >
              <div
                className={`${styles.projectMedia} ${styles.claimchainMedia}`}
              >
                <ProjectEvidence project="claimchain" />
              </div>

              <div className={styles.projectCopy}>
                <div className={styles.projectNarrative}>
                  <p className={styles.projectMeta}>Independent product engineering · 2025–2026</p>
                  <h3 id="claimchain-title">ClaimChain</h3>
                  <p className={styles.projectLead}>
                    An independent test-data prototype for a three-role claims workflow: providers
                    submit claims, administrators review and package them, and buyers purchase
                    anonymized inventory.
                  </p>
                </div>
                <dl className={`${styles.projectFacts} ${styles.projectDetailFacts}`}>
                  <div>
                    <dt>Authority</dt>
                    <dd>
                      The backend controls eligibility, lifecycle, payment state, and export
                      access; ML remains advisory.
                    </dd>
                  </div>
                  <div>
                    <dt>Implemented flow</dt>
                    <dd>
                      Administrative review, Stripe test-payment reconciliation, and entitled PDF
                      export across three roles.
                    </dd>
                  </div>
                </dl>
                <div className={styles.projectLinks}>
                  <Link href="/work/claimchain">
                    Read case study <Arrow />
                  </Link>
                  <a href="https://github.com/edwardsong08/ClaimChain" target="_blank" rel="noreferrer">
                    View repository <Arrow external />
                  </a>
                </div>
              </div>
            </article>

            <article
              id="project-ryu"
              className={styles.project}
              aria-labelledby="ryu-title"
              data-mobile-active={activeMobileProject === 'project-ryu' ? 'true' : 'false'}
            >
              <div className={styles.projectMedia}>
                <ProjectEvidence project="ryu-legal" />
              </div>

              <div className={styles.projectCopy}>
                <div className={styles.projectNarrative}>
                  <p className={styles.projectMeta}>Contract engineering · Ongoing since 2022</p>
                  <h3 id="ryu-title">Ryu Legal</h3>
                  <p className={styles.projectLead}>
                    Ongoing product and engineering work for a live NJ/NY law-firm site, from
                    information architecture and interface design through deployment, SEO, and
                    maintenance.
                  </p>
                </div>
                <dl className={`${styles.projectFacts} ${styles.projectDetailFacts}`}>
                  <div>
                    <dt>Client path</dt>
                    <dd>
                      Clear service information, visible legal disclosures, and a direct contact
                      workflow.
                    </dd>
                  </div>
                  <div>
                    <dt>Safeguards</dt>
                    <dd>
                      Server validation and bounded failure handling protect the contact workflow
                      while provider credentials remain outside the browser.
                    </dd>
                  </div>
                </dl>
                <div className={styles.projectLinks}>
                  <Link href="/work/ryu-legal">
                    Read case study <Arrow />
                  </Link>
                  <a href="https://www.ryu-legal.com" target="_blank" rel="noreferrer">
                    Visit live site <Arrow external />
                  </a>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section
          id="experience"
          className={`${styles.section} ${styles.experienceSection} ${styles.traceSection}`}
          aria-labelledby="experience-title"
          data-trace-active={activePrimarySection === 'experience' ? 'true' : 'false'}
        >
          <div className={styles.sectionHeading}>
            <h2 id="experience-title" className={styles.traceTitle}>
              Experience
            </h2>
            <a className={styles.textLink} href="/Resume-Edward_Song.pdf" target="_blank" rel="noreferrer">
              Full résumé <Arrow external />
            </a>
          </div>

          <ol className={styles.experienceList}>
            {experience.map((item) => (
              <li key={`${item.dates}-${item.role}`}>
                <time>{item.dates}</time>
                <p>{item.role}</p>
                <p>{item.organization}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="capabilities"
          className={`${styles.section} ${styles.capabilitySection} ${styles.traceSection}`}
          aria-labelledby="capabilities-title"
          data-trace-active={activePrimarySection === 'capabilities' ? 'true' : 'false'}
        >
          <div className={styles.sectionHeading}>
            <h2 id="capabilities-title" className={styles.traceTitle}>
              Capabilities
            </h2>
          </div>

          <ul className={styles.capabilityList}>
            {capabilities.map((capability) => (
              <li key={capability.title}>
                <h3>{capability.title}</h3>
                <div>
                  <p>{capability.description}</p>
                  <p className={styles.capabilityEvidence}>
                    <span>{capability.annotation}:</span>{' '}
                    <span>{capability.evidence}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="about"
          className={`${styles.section} ${styles.aboutSection} ${styles.traceSection}`}
          aria-labelledby="about-title"
          data-trace-active={activePrimarySection === 'about' ? 'true' : 'false'}
        >
          <div className={styles.aboutCopy}>
            <p className={`${styles.sectionLabel} ${styles.traceTitle}`}>
              About
            </p>
            <h2 id="about-title">Language, judgment, and systems.</h2>
            <p className={styles.aboutLead}>
              Before software, my work moved between classrooms, writing rooms, and legal offices.
              For more than fifteen years, I taught English and prepared students for the SAT, LSAT,
              graduate admissions, and application writing. I also wrote comedy professionally and
              worked in legal operations. Each required close reading, precise language, and
              judgment about what matters.
            </p>
            <div className={styles.aboutClosing}>
              <p>
                Those habits now inform product discovery, requirements, documentation, and the
                decisions that connect technical and nontechnical teams.
              </p>
              <p>
                Based in Northern New Jersey. Korean and English. Away from work: hiking, guitar,
                reading, golf, and travel.
              </p>
            </div>
          </div>

          <figure className={styles.aboutImage}>
            <Image
              src="/about4.webp"
              alt="Edward Song smiling in a car beside his Labrador"
              fill
              sizes="(max-width: 760px) 88vw, 30vw"
              className={styles.projectImage}
            />
          </figure>
        </section>

        <section
          id="contact"
          className={`${styles.section} ${styles.contactSection} ${styles.traceSection}`}
          aria-labelledby="contact-title"
          data-active={activePrimarySection === 'contact' ? 'true' : 'false'}
          data-trace-active={activePrimarySection === 'contact' ? 'true' : 'false'}
        >
          <div>
            <p className={`${styles.sectionLabel} ${styles.traceTitle}`}>
              Contact
            </p>
            <h2 id="contact-title">
              Interested in senior product engineering, forward-deployed engineering, and technical lead roles.
            </h2>
          </div>
          <div className={styles.contactLinks}>
            <a className={styles.primaryLink} href={`mailto:${EMAIL}`}>
              Email me <Arrow external />
            </a>
            <a href="/Resume-Edward_Song.pdf" target="_blank" rel="noreferrer">
              View résumé <Arrow external />
            </a>
            <a href="https://www.linkedin.com/in/edward-y-song" target="_blank" rel="noreferrer">
              LinkedIn <Arrow external />
            </a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Edward Song</p>
        <div>
          <a href="https://github.com/edwardsong08" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/edward-y-song" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={`mailto:${EMAIL}`}>Email</a>
        </div>
      </footer>
    </div>
  );
}
