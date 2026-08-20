import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { ProjectEvidence } from './ProjectEvidence';
import SmokeField from './SmokeField';
import styles from './PortfolioZen.module.css';

const EMAIL = 'edwardsong08@gmail.com';

const capabilities = [
  {
    title: 'Product definition and design',
    description:
      'Translate ambiguous asks into scoped work, then align execution with measurable outcomes.',
    evidence: 'Discovery, planning, workflow design, scope.',
  },
  {
    title: 'Engineering across the stack',
    description:
      'Build and evolve systems end-to-end with explicit boundaries and maintainable handoffs.',
    evidence: 'Next.js, Laravel, Spring Boot, FastAPI, Go, PostgreSQL, Supabase',
  },
  {
    title: 'Security, compliance, and access',
    description:
      'Convert policy into explicit permissions, validation, and safe exposure boundaries.',
    evidence: 'RBAC, RLS, auditability, validation, privacy controls',
  },
  {
    title: 'Delivery and operations',
    description:
      'Sustain production quality through CI/CD, deployment discipline, and coordinated operations.',
    evidence: 'Linux, Proxmox, Cloudflare, Coolify, AWS, CI/CD',
  },
  {
    title: 'Technical leadership',
    description:
      'Set direction with the board, then coordinate execution decisions across product, network, and operations teams.',
    evidence: 'Roadmapping, review, tradeoff management, cross-team delivery',
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
    organization: 'Ryu Legal · contracts',
  },
  {
    dates: '2021–2023',
    role: 'Product Engineer',
    organization: 'Legal Startup',
  },
];

const projects = [
  { id: 'project-troa', label: 'TROA' },
  { id: 'project-claimchain', label: 'ClaimChain' },
  { id: 'project-ryu', label: 'Ryu Legal' },
];

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

function WorkIndex() {
  const [activeProject, setActiveProject] = useState(projects[0].id);

  useEffect(() => {
    const targets = projects
      .map((project) => document.getElementById(project.id))
      .filter((target): target is HTMLElement => Boolean(target));

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              Math.abs(first.boundingClientRect.top - window.innerHeight * 0.32) -
              Math.abs(second.boundingClientRect.top - window.innerHeight * 0.32),
          )[0];

        if (visibleEntry) setActiveProject(visibleEntry.target.id);
      },
      {
        rootMargin: '-18% 0px -54% 0px',
        threshold: [0, 0.1, 0.35],
      },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className={styles.workIndex} aria-label="Selected project index">
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <a
              href={`#${project.id}`}
              aria-current={activeProject === project.id ? 'location' : undefined}
            >
              {project.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function PortfolioZen() {
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
            <p className={styles.heroKicker}>Current work · TROA</p>
            <p className={styles.heroSummary}>
              Volunteer CTO at TROA, setting technical direction with the board and coordinating
              multidisciplinary delivery from product design through engineering, security,
              deployment, and performance. TROA’s technology function is delivered through a team model that now supports public services, internal operations, hiring, training, support, and game systems.
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

      <nav className={styles.stickyNav} aria-label="Primary navigation">
        <div className={styles.navInner}>
          <a className={styles.navName} href="#top" aria-label="Edward Song, back to top">
            ES
          </a>
          <ul>
            <li>
              <a href="#work">Work</a>
            </li>
            <li className={styles.secondaryNavItem}>
              <a href="#capabilities">Capabilities</a>
            </li>
            <li>
              <a href="#experience">Experience</a>
            </li>
            <li className={styles.secondaryNavItem}>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
            <li>
              <a href="/Resume-Edward_Song.pdf" target="_blank" rel="noreferrer">
                Résumé
              </a>
            </li>
          </ul>
        </div>
        <span className={styles.progressTrack} aria-hidden="true">
          <ScrollProgress />
        </span>
      </nav>

      <main>
        <section id="work" className={`${styles.section} ${styles.workSection}`} aria-labelledby="work-title">
          <div className={styles.sectionHeading}>
            <h2 id="work-title">Selected work</h2>
            <p>
              Three projects at different scales: an organization-wide product ecosystem, an
              independent workflow prototype, and a maintained production site for a client.
            </p>
          </div>

          <WorkIndex />

          <div className={styles.projectList}>
            <article id="project-troa" className={styles.project} aria-labelledby="troa-title">
              <div className={styles.projectMedia}>
                <ProjectEvidence project="troa" />
              </div>

              <div className={styles.projectCopy}>
                <div className={styles.projectNarrative}>
                  <p className={styles.projectMeta}>Volunteer CTO · Active since 2026</p>
                  <h3 id="troa-title">TROA</h3>
                  <p className={styles.projectLead}>
                    A nonprofit technology ecosystem supporting more than 50 volunteers and a 800+
                    member community. Public services, internal administration, onboarding, support,
                    and game systems are coordinated through shared technical direction.
                  </p>
                  <dl className={styles.projectFacts}>
                    <div>
                      <dt>Product scope</dt>
                      <dd>
                        Public platform, admin, careers, ticketing, LMS, map, assistant, and game tools.
                      </dd>
                    </div>
                    <div>
                      <dt>Technical model</dt>
                      <dd>
                        Shared identity, role-gated administration, server-side privileged access,
                        audited workflows, and separate trust boundaries across applications.
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className={styles.projectLinks}>
                  <Link href="/work/troa">
                    Read case study <Arrow />
                  </Link>
                  <a href="https://therealmsofasgard.com" target="_blank" rel="noreferrer">
                    Visit public platform <Arrow external />
                  </a>
                </div>
              </div>
            </article>

            <article
              id="project-claimchain"
              className={`${styles.project} ${styles.projectReverse}`}
              aria-labelledby="claimchain-title"
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
                    Independent prototype using test data, not an operating marketplace.
                    Providers submit claims, administrators review and package them, and
                    buyers purchase anonymized inventory.
                  </p>
                  <dl className={styles.projectFacts}>
                    <div>
                      <dt>Control boundary</dt>
                      <dd>
                        The backend controls eligibility, payment state, and export access. ML is
                        advisory only.
                      </dd>
                    </div>
                    <div>
                      <dt>Built across</dt>
                      <dd>
                        Next.js, Spring Boot, PostgreSQL, FastAPI, Stripe webhooks, and an AWS
                        staging workflow.
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className={styles.projectLinks}>
                  <Link href="/work/claimchain">
                    Read case study <Arrow />
                  </Link>
                  <a href="https://claimchain-tan.vercel.app" target="_blank" rel="noreferrer">
                    Open hosted demo <Arrow external />
                  </a>
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
            >
              <div className={styles.projectMedia}>
                <ProjectEvidence project="ryu-legal" />
              </div>

              <div className={styles.projectCopy}>
                <div className={styles.projectNarrative}>
                  <p className={styles.projectMeta}>Contract engineering · Ongoing since 2022</p>
                  <h3 id="ryu-title">Ryu Legal</h3>
                  <p className={styles.projectLead}>
                    End-to-end work on a New Jersey/New York law firm website:
                    requirements, implementation, SEO, deployment, and ongoing maintenance.
                  </p>
                  <dl className={styles.projectFacts}>
                    <div>
                      <dt>Client path</dt>
                      <dd>
                        Service information, legal disclosures, and a clear service-to-contact flow.
                      </dd>
                    </div>
                    <div>
                      <dt>Production boundary</dt>
                      <dd>
                        Contact requests are bounded and validated on the server before email
                        delivery; provider credentials remain outside the browser.
                      </dd>
                    </div>
                  </dl>
                </div>
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
          id="capabilities"
          className={`${styles.section} ${styles.capabilitySection}`}
          aria-labelledby="capabilities-title"
        >
          <div className={styles.sectionHeading}>
            <h2 id="capabilities-title">How the work runs</h2>
            <p>
              Delivery is strongest when each layer has clear boundaries and a clear next step.
            </p>
          </div>

          <ul className={styles.capabilityList}>
            {capabilities.map((capability) => (
              <li key={capability.title}>
                <h3>{capability.title}</h3>
                <div>
                  <p>{capability.description}</p>
                  <p className={styles.capabilityEvidence}>{capability.evidence}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="experience"
          className={`${styles.section} ${styles.experienceSection}`}
          aria-labelledby="experience-title"
        >
          <div className={styles.sectionHeading}>
            <h2 id="experience-title">Experience</h2>
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

        <section id="about" className={`${styles.section} ${styles.aboutSection}`} aria-labelledby="about-title">
          <div className={styles.aboutCopy}>
            <p className={styles.sectionLabel}>About</p>
            <h2 id="about-title">Writing and teaching shape the engineering approach.</h2>
            <p>
              For over fifteen years, English instruction has supported tutoring and admissions advising
              across SAT English, LSAT, and graduate-school preparation, including admissions
              strategy and writing coaching. Professional comedy writing also shaped a habit of
              concise, audience-first communication.
            </p>
            <p>
              That background reinforces a practical approach to ambiguity: structuring complex
              information, adapting explanations to different audiences, and turning technical
              decisions into clear requirements and documentation for cross-functional teams.
            </p>
            <p>
              Korean and English fluency, along with a Northern New Jersey base, anchor how this work
              is done with community teams. Outside the screen, this includes hiking, guitar, reading,
              golfing, and travel.
            </p>
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

        <section id="contact" className={`${styles.section} ${styles.contactSection}`} aria-labelledby="contact-title">
          <div>
            <p className={styles.sectionLabel}>Contact</p>
            <h2 id="contact-title">
              Open to senior product engineering, forward-deployed engineering, and technical lead roles.
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
