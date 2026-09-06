import Image from 'next/image';
import Link from 'next/link';
import { type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type RefObject, useEffect, useRef, useState } from 'react';

import { SitePagePreview } from './ProjectEvidence';
import FluidHero from './FluidHero';
import styles from './PortfolioZen.module.css';

const EMAIL = 'edwardsong08@gmail.com';
type StewardshipSlide = 'troa-nonprofit' | 'troa-gaming' | 'ryu';
const stewardshipSlides: StewardshipSlide[] = ['troa-nonprofit', 'troa-gaming', 'ryu'];
const REALM_MAP_ORIGIN = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5173'
  : 'https://troa-realms.therealmsofasgard.com';
const REALM_MAP_ORB_ID = '90d6eedd-56dd-448f-a6d5-8b830af0bb1f';
const realmMapObjects = [
  { id: 'ce6461bc-6e7a-4275-b932-93e9f086e89b', label: 'Earth' },
  { id: 'b003b255-e9ae-4edb-9e17-2f9131a95ba3', label: 'Mars' },
  { id: '58cb6069-4bda-4925-9a23-765c2851bbd2', label: 'Pertam' },
  { id: 'cfb01b42-53da-4777-a7e5-bec89e479910', label: 'TROA Trade Station' },
] as const;

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

const primarySections = [
  { id: 'work', label: 'Work' },
  { id: 'systems', label: 'Independent' },
  { id: 'hub', label: 'Hub' },
  { id: 'experience', label: 'Experience' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const;

const primarySectionIds = primarySections.map((section) => section.id);

const stewardshipStories = [
  {
    id: 'troa-nonprofit', label: 'TROA Nonprofit',
    meta: 'Volunteer CTO · Since 2026',
    summary: 'I lead the technology behind a volunteer-run community, connecting its public services with recruitment, learning, and day-to-day operations.',
    facts: [
      { label: 'Responsibility', value: 'Board-level planning, hands-on product engineering, and direction across software, design, network engineering, and IT.' },
      { label: 'In practice', value: 'Public information, volunteer applications, training, and staff workflows for 50+ volunteers and an 800-plus-member community.' },
    ],
    caseStudy: '/work/troa', liveUrl: 'https://therealmsofasgard.com', liveLabel: 'Visit main site',
  },
  {
    id: 'troa-gaming', label: 'TROA Gaming',
    meta: 'Interactive 3D map · Community infrastructure',
    summary: 'A live map for a persistent Space Engineers community. Explore planets, stations, and connected routes in the world its members share.',
    facts: [
      { label: 'My work', value: 'Map engineering, systems design, and the infrastructure connecting the game world with its community tools.' },
      { label: 'Try it', value: 'Choose a destination below the map to move between objects. Open the full map for navigation and community features.' },
    ],
    caseStudy: '/work/troa', liveUrl: 'https://troa-realms.therealmsofasgard.com/map', liveLabel: 'Open full map',
  },
  {
    id: 'ryu', label: 'Ryu Legal',
    meta: 'Client technology ownership · Since 2022',
    summary: 'Long-term responsibility for a law firm’s website and supporting technology—from understanding the practice to building, deploying, and maintaining the systems it uses.',
    facts: [
      { label: 'Responsibility', value: 'Requirements, interface design, application engineering, deployment, ongoing maintenance, and wider IT needs.' },
      { label: 'Shown here', value: 'The public NJ/NY site: clear service information and a contact flow with server-side validation and delivery safeguards.' },
    ],
    caseStudy: '/work/ryu-legal', liveUrl: 'https://www.ryu-legal.com', liveLabel: 'Visit live site',
  },
] as const;

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

function LiveRealmMapEmbed({
  active,
  objectId,
  onObjectChange,
  frameRef,
}: {
  active: boolean;
  objectId: string;
  onObjectChange: (objectId: string) => void;
  frameRef: RefObject<HTMLIFrameElement | null>;
}) {
  const [hasLoaded, setHasLoaded] = useState(active);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [mapScale, setMapScale] = useState(0.5);
  const mapUrl = `${REALM_MAP_ORIGIN}/map?embed=profile&mode=object-detail&orb=${REALM_MAP_ORB_ID}&object=${realmMapObjects[0].id}`;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => setMapScale(entry.contentRect.width / 1440));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  // Keep the renderer mounted after the first visit so camera moves do not reload assets.
  if (active && !hasLoaded) setHasLoaded(true);

  return (
    <section className={styles.realmMapEmbed} aria-label="Interactive TROA Space Engineers realm map">
      <div ref={viewportRef} className={styles.realmMapViewport}>
        {hasLoaded ? (
          <iframe
            className={styles.realmMapFrame}
            style={{ width: 1440, height: 900, transform: `scale(${mapScale})`, transformOrigin: 'top left' }}
            src={mapUrl}
            title="The End World interactive Space Engineers map"
            loading="eager"
            ref={frameRef}
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => onObjectChange(objectId)}
          />
        ) : (
          <div className={styles.realmMapStandby}>Open the gaming slide to load the live map.</div>
        )}
      </div>
    </section>
  );
}

function HubEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let restoreScroll: (() => void) | undefined;
    const unlock = () => {
      restoreScroll?.();
      restoreScroll = undefined;
    };
    const lock = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || restoreScroll) return;
      // Wheel events inside this cross-origin iframe do not bubble to React.
      // Hold the parent scroll container while the pointer is over the map.
      const root = document.documentElement;
      const overflow = root.style.overflow;
      const gutter = root.style.scrollbarGutter;
      // Preserve an existing scrollbar without adding one on overlay systems.
      if (root.clientWidth < window.innerWidth) root.style.scrollbarGutter = 'stable';
      root.style.overflow = 'hidden';
      restoreScroll = () => {
        root.style.overflow = overflow;
        root.style.scrollbarGutter = gutter;
      };
    };
    container.addEventListener('pointerenter', lock);
    container.addEventListener('pointerleave', unlock);
    container.addEventListener('pointercancel', unlock);
    window.addEventListener('pagehide', unlock);
    return () => {
      unlock();
      container.removeEventListener('pointerenter', lock);
      container.removeEventListener('pointerleave', unlock);
      container.removeEventListener('pointercancel', unlock);
      window.removeEventListener('pagehide', unlock);
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.hubEmbed}>
      <iframe
        className={styles.hubFrame}
        src={process.env.NODE_ENV === 'development'
          ? 'http://localhost:3001/embed/profile'
          : 'https://hub.edsong.xyz/embed/profile'}
        title="ES/HUB living systems map"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
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
  const [activeStewardship, setActiveStewardship] = useState<StewardshipSlide>('troa-nonprofit');
  const [selectedRealmObject, setSelectedRealmObject] = useState<string>(realmMapObjects[0].id);
  const realmMapFrameRef = useRef<HTMLIFrameElement>(null);
  const [activePrimarySection, setActivePrimarySection] = useActiveSection(
    primarySectionIds,
    0.32,
    false,
  );
  const stewardshipPointerStart = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const activeStewardshipIndex = stewardshipSlides.indexOf(activeStewardship);

  const handleRealmObjectChange = (objectId: string) => {
    setSelectedRealmObject(objectId);
    realmMapFrameRef.current?.contentWindow?.postMessage(
      { type: 'troa-profile-map-select', objectId },
      REALM_MAP_ORIGIN,
    );
  };

  const handleStewardshipPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    stewardshipPointerStart.current = null;
    if (!event.isPrimary || event.button !== 0) return;
    if ((event.target as Element).closest('button, a')) return;
    const scroller = (event.target as Element).closest<HTMLElement>('[data-page-preview-scroll]');
    if (scroller) {
      const scrollbarWidth = scroller.offsetWidth - scroller.clientWidth;
      if (scrollbarWidth > 0 && event.clientX >= scroller.getBoundingClientRect().right - scrollbarWidth - 2) return;
    }
    stewardshipPointerStart.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  };

  const handleStewardshipPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = stewardshipPointerStart.current;
    stewardshipPointerStart.current = null;
    if (start === null || start.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;
    const nextIndex = deltaX < 0
      ? Math.min(activeStewardshipIndex + 1, stewardshipSlides.length - 1)
      : Math.max(activeStewardshipIndex - 1, 0);
    selectStewardship(stewardshipSlides[nextIndex]);
  };
  const selectStewardship = (slide: StewardshipSlide) => {
    setActiveStewardship(slide);
    window.history.replaceState(null, '', `#project-${slide}`);
  };

  const handleStewardshipKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const current = stewardshipSlides.indexOf(activeStewardship);
    const next = event.key === 'Home' ? 0
      : event.key === 'End' ? stewardshipSlides.length - 1
      : event.key === 'ArrowRight' ? (current + 1) % stewardshipSlides.length
      : event.key === 'ArrowLeft' ? (current + stewardshipSlides.length - 1) % stewardshipSlides.length
      : null;
    if (next === null) return;
    event.preventDefault();
    const slide = stewardshipSlides[next];
    selectStewardship(slide);
    document.getElementById(`tab-${slide}`)?.focus({ preventScroll: true });
  };

  useEffect(() => {
    const syncSlide = () => {
      const slide = stewardshipSlides.find(id => window.location.hash === `#project-${id}`);
      if (!slide) return;
      setActiveStewardship(slide);
      document.getElementById('project-troa')?.scrollIntoView({ block: 'start' });
    };
    const frame = window.requestAnimationFrame(syncSlide);
    window.addEventListener('hashchange', syncSlide);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', syncSlide);
    };
  }, []);

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#work">
        Skip to selected work
      </a>

      <header id="top" className={styles.hero}>
        <FluidHero />

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
              I turn complex needs into useful software—and stay responsible for the systems
              behind it. Hands-on engineering, from the first conversation to ongoing operation.
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
              Technology ownership
            </h2>
            <p>
              I lead technology end to end—from product direction and application development to
              infrastructure, security, and ongoing operations.
            </p>
          </div>

          <div className={styles.projectList}>
            <article
              id="project-troa"
              className={`${styles.project} ${styles.troaProject} ${styles.stewardshipArticle}`}
              aria-label="Nonprofit and client technology projects"
            >
              <div className={styles.stewardshipSwitcher} role="tablist" aria-label="Choose a project" onKeyDown={handleStewardshipKeyDown}>
                {stewardshipStories.map(story => (
                  <button key={story.id} id={`tab-${story.id}`} type="button" role="tab"
                    aria-selected={activeStewardship === story.id}
                    aria-controls={`project-${story.id}`}
                    tabIndex={activeStewardship === story.id ? 0 : -1}
                    onClick={() => selectStewardship(story.id)}>
                    {story.label}
                  </button>
                ))}
              </div>
              <div
                className={styles.projectMedia}
                onPointerDown={handleStewardshipPointerDown}
                onPointerUp={handleStewardshipPointerUp}
                onPointerCancel={() => { stewardshipPointerStart.current = null; }}
              >
                <div className={styles.stewardshipPrimaryMedia} aria-live="polite">
                  <div
                    className={styles.stewardshipMediaTrack}
                    style={{ transform: `translateX(-${activeStewardshipIndex * (100 / 3)}%)` }}
                  >
                    <div className={styles.stewardshipMediaSlide} aria-hidden={activeStewardship !== 'troa-nonprofit'} inert={activeStewardship !== 'troa-nonprofit'}>
                      <SitePagePreview project="troa" />
                    </div>
                    <div className={styles.stewardshipMediaSlide} aria-hidden={activeStewardship !== 'troa-gaming'} inert={activeStewardship !== 'troa-gaming'}>
                      <LiveRealmMapEmbed
                        active={activeStewardship === 'troa-gaming'}
                        objectId={selectedRealmObject}
                        onObjectChange={handleRealmObjectChange}
                        frameRef={realmMapFrameRef}
                      />
                    </div>
                    <div className={styles.stewardshipMediaSlide} aria-hidden={activeStewardship !== 'ryu'} inert={activeStewardship !== 'ryu'}>
                      <SitePagePreview project="ryu-legal" />
                    </div>
                  </div>
                </div>
                <div className={styles.realmControls} data-visible={activeStewardship === 'troa-gaming'} inert={activeStewardship !== 'troa-gaming'}>
                  <span className={styles.realmControlsLabel}>Explore the realm</span>
                  <div className={styles.realmDestinations} role="group" aria-label="Map destinations">
                    {realmMapObjects.map((object, index) => (
                      <button key={object.id} type="button" aria-pressed={selectedRealmObject === object.id} onClick={() => handleRealmObjectChange(object.id)}>
                        <svg viewBox="0 0 40 40" aria-hidden="true" className={styles.realmDestinationIcon} data-world={index}>
                          {index === 3 ? <><path d="M16 12h8v16h-8zM5 15h8v10H5zM27 15h8v10h-8zM13 20h3m8 0h3M20 6v6m0 16v6" /><path d="M9 15v10m22-10v10" /></> : <>
                            <circle cx="20" cy="20" r="13" />
                            {index === 0 ? <path d="m13 10 6 5-2 4 5 3-2 8m4-20-2 6 7 2 3 4" /> : index === 1 ? <path d="m10 16 9 3 5-3 7 4M12 25l7-3 7 5" /> : <><ellipse cx="20" cy="20" rx="17" ry="5" transform="rotate(-25 20 20)" /><path d="m16 10 6 4m-7 13 6 3" /></>}
                          </>}
                        </svg>
                        <span>{index === 3 ? 'Trade Station' : object.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.stewardshipPanels}>
                {stewardshipStories.map(story => (
                  <div key={story.id} id={`project-${story.id}`} role="tabpanel"
                    aria-labelledby={`tab-${story.id}`}
                    aria-hidden={activeStewardship !== story.id}
                    inert={activeStewardship !== story.id}
                    tabIndex={activeStewardship === story.id ? 0 : -1}
                    className={styles.stewardshipPanel}>
                    <p className={styles.projectMeta}>{story.meta}</p>
                    <h3>{story.label}</h3>
                    <p className={styles.projectLead}>{story.summary}</p>
                    <dl className={styles.projectFacts}>
                      {story.facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
                    </dl>
                    <div className={styles.projectLinks}>
                      <Link href={story.caseStudy}>Read case study <Arrow /></Link>
                      <a href={story.liveUrl} target="_blank" rel="noreferrer">{story.liveLabel} <Arrow external /></a>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section
          id="systems"
          className={`${styles.section} ${styles.systemsSection} ${styles.traceSection}`}
          aria-labelledby="systems-title"
          data-trace-active={activePrimarySection === 'systems' ? 'true' : 'false'}
        >
          <div className={styles.sectionHeading}>
            <h2 id="systems-title" className={styles.traceTitle}>Independent work</h2>
            <p>
              Two ongoing projects: one explores how AI uses context; the other makes room
              for writing, editorial design, and thinking in public.
            </p>
          </div>

          <div className={styles.systemsGrid}>
            <article className={styles.systemCard}>
              <div className={styles.systemPreview}>
                <div className={styles.systemPreviewFrame}>
                  <SitePagePreview project="fourme" sizes="(max-width: 820px) 100vw, 46vw" />
                </div>
                <p className={styles.systemPreviewCaption}>Public research page · Scroll to explore</p>
              </div>
              <p className={styles.projectMeta}>Personal knowledge platform · Research build</p>
              <h3>4ME OS</h3>
              <p>
                A self-hosted system for giving AI tools the right approved project context—without
                making any one assistant the source of truth.
              </p>
              <dl className={styles.systemFacts}>
                <div><dt>Working core</dt><dd>Permission-scoped context previews and review-only change proposals, tested with synthetic data.</dd></div>
                <div><dt>Still being tested</dt><dd>Whether reviewed context handoffs improve on simpler tools. Broad personal ingestion remains restricted.</dd></div>
              </dl>
              <div className={styles.projectLinks}>
                <a href="https://4me.edsong.xyz" target="_blank" rel="noreferrer">Visit 4ME OS <Arrow external /></a>
                <a href="https://github.com/edwardsong08/4me-os" target="_blank" rel="noreferrer">View repository <Arrow external /></a>
              </div>
            </article>

            <article className={styles.systemCard}>
              <div className={styles.systemPreview}>
                <div className={styles.systemPreviewFrame}>
                  <SitePagePreview project="newsroom" sizes="(max-width: 820px) 100vw, 46vw" />
                </div>
                <p className={styles.systemPreviewCaption}>The full front page · Scroll to explore</p>
              </div>
              <p className={styles.projectMeta}>Editorial application · Live publication</p>
              <h3>Newsroom</h3>
              <p>
                A personal publication about technology, changing careers, and everyday life.
                A newspaper on the surface; a deliberate editorial workflow underneath.
              </p>
              <dl className={styles.systemFacts}>
                <div><dt>My work</dt><dd>Editorial design, application engineering, and a source-controlled publishing workflow.</dd></div>
                <div><dt>In practice</dt><dd>Articles organized into desks, with explicit placement rules, review, and author approval before publication.</dd></div>
              </dl>
              <div className={styles.projectLinks}>
                <a href="https://news.edsong.xyz" target="_blank" rel="noreferrer">Visit Newsroom <Arrow external /></a>
                <a href="https://github.com/edwardsong08/newsroom" target="_blank" rel="noreferrer">View repository <Arrow external /></a>
              </div>
            </article>
          </div>
          <aside id="project-claimchain" className={styles.earlierWork} aria-labelledby="earlier-work-title">
            <div>
              <p className={styles.sectionLabel}>Earlier work · Independent prototype</p>
              <h3 id="earlier-work-title">ClaimChain</h3>
            </div>
            <p>A three-role prototype for reviewing claims, testing purchases, and controlling document access. A focused study in backend authority and payment workflows.</p>
            <div className={styles.projectLinks}>
              <Link href="/work/claimchain">Read case study <Arrow /></Link>
              <Link href="/work/claimchain#demo">Watch demo · 3:30 <Arrow /></Link>
              <a href="https://github.com/edwardsong08/claimchain-platform" target="_blank" rel="noreferrer">View repository <Arrow external /></a>
            </div>
          </aside>
        </section>

        <section
          id="hub"
          className={`${styles.section} ${styles.hubSection} ${styles.traceSection}`}
          aria-labelledby="hub-title"
          data-trace-active={activePrimarySection === 'hub' ? 'true' : 'false'}
        >
          <div className={styles.hubCopy}>
            <p className={`${styles.sectionLabel} ${styles.traceTitle}`}>The map behind the work</p>
            <h2 id="hub-title">The work, connected.</h2>
            <p>
              An interactive map of my projects and the infrastructure behind them.
              Follow a connection to see how the public sites, private tools, and services fit together.
            </p>
            <a className={styles.textLink} href="https://hub.edsong.xyz" target="_blank" rel="noreferrer">
              Explore the Hub <Arrow external />
            </a>
          </div>
          <HubEmbed />
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
              Let’s build something useful.
            </h2>
            <p className={styles.contactNote}>Open to senior product engineering, forward-deployed engineering, and technical lead roles.</p>
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
