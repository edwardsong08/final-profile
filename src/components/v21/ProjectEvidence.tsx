import Image from 'next/image';
import { useRef, useState } from 'react';

import styles from './ProjectEvidence.module.css';

type EvidenceProps = {
  priority?: boolean;
};

const troaPages = [
  {
    label: 'Home',
    path: '/',
    description: 'mission, support, community, and ways to participate',
    image: '/case-studies/troa-pages/home-full.webp',
    height: 2942,
  },
  {
    label: 'Gaming Hub',
    path: '/gaming-hub',
    description: 'game servers, streams, events, and community programs',
    image: '/case-studies/troa-pages/gaming-hub-full.webp',
    height: 5625,
  },
  {
    label: 'Events',
    path: '/events',
    description: 'the public community calendar and event information',
    image: '/case-studies/troa-pages/events-full.webp',
    height: 1905,
  },
  {
    label: 'Mental Health Resources',
    path: '/mental-health/resources',
    description: 'national and state mental-health support listings',
    image: '/case-studies/troa-pages/resources-full.webp',
    height: 2464,
  },
  {
    label: 'Server Status',
    path: '/server-stats',
    description: 'public services and game-server availability',
    image: '/case-studies/troa-pages/server-status-full.webp',
    height: 2033,
  },
  {
    label: 'Knowledge & Lore',
    path: '/knowledge-lore',
    description: 'the organization’s origins, history, and identity',
    image: '/case-studies/troa-pages/knowledge-lore-full.webp',
    height: 3491,
  },
  {
    label: 'Meet the Teams',
    path: '/meet-the-team',
    description: 'leadership and multidisciplinary volunteer teams',
    image: '/case-studies/troa-pages/teams-full.webp',
    height: 6664,
  },
] as const;

export function TroaEvidence({ priority = false }: EvidenceProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [engagement, setEngagement] = useState<'none' | 'keyboard' | 'touch'>('none');
  const pointerTypeRef = useRef<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activePage = troaPages[activeIndex];

  const selectPage = (index: number) => {
    scrollerRef.current?.scrollTo({ top: 0 });
    setEngagement('none');
    setActiveIndex(index);
  };

  const movePage = (direction: -1 | 1) => {
    selectPage((activeIndex + direction + troaPages.length) % troaPages.length);
  };

  return (
    <figure className={`${styles.artifact} ${styles.troaArtifact}`}>
      <div className={`${styles.artifactHeader} ${styles.troaHeader}`}>
        <span className={styles.troaHeaderTitle}>TROA public platform</span>
        <div className={styles.troaControls}>
          <button type="button" onClick={() => movePage(-1)} aria-label="Show previous TROA page">
            <span aria-hidden="true">‹</span>
          </button>
          <label>
            <span className={styles.visuallyHidden}>Choose a TROA public page</span>
            <select
              value={activeIndex}
              onChange={(event) => selectPage(Number(event.target.value))}
            >
              {troaPages.map((page, index) => (
                <option value={index} key={page.path}>
                  {page.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => movePage(1)} aria-label="Show next TROA page">
            <span aria-hidden="true">›</span>
          </button>
          <span className={styles.troaPageCount} aria-live="polite">
            {activeIndex + 1}/{troaPages.length}
          </span>
          <a
            className={styles.troaOpenLink}
            href={`https://therealmsofasgard.com${activePage.path}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open the live TROA ${activePage.label} page in a new tab`}
          >
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className={styles.troaFrameStage}>
        <div
          className={styles.troaScroller}
          data-engagement={engagement}
          role="region"
          aria-label={`Scrollable preview of the TROA ${activePage.label} public page`}
          tabIndex={0}
          ref={scrollerRef}
          onBlur={() => {
            pointerTypeRef.current = null;
            setEngagement('none');
          }}
          onFocus={() => {
            const pointerType = pointerTypeRef.current;
            setEngagement(pointerType ? (pointerType === 'mouse' ? 'none' : 'touch') : 'keyboard');
            pointerTypeRef.current = null;
          }}
          onKeyDown={() => setEngagement('keyboard')}
          onPointerDown={(event) => {
            pointerTypeRef.current = event.pointerType;
            setEngagement(event.pointerType === 'mouse' ? 'none' : 'touch');
          }}
        >
          <Image
            key={activePage.path}
            src={activePage.image}
            alt={`TROA ${activePage.label} public page showing ${activePage.description}`}
            width={1280}
            height={activePage.height}
            loading={priority && activeIndex === 0 ? 'eager' : 'lazy'}
            sizes="(max-width: 960px) 100vw, 58vw"
            className={styles.troaLongScreenshot}
          />
        </div>
        <span className={styles.scrollCue} aria-hidden="true">
          Scroll preview
        </span>
      </div>
      <figcaption className={styles.visuallyHidden}>
        TROA {activePage.label}: {activePage.description}.
      </figcaption>
    </figure>
  );
}

/*
 * The remaining project artifacts are intentionally self-contained. ClaimChain
 * communicates a control boundary; Ryu Legal is an authentic scrollable capture.
 */
type ClaimChainEvidenceProps = {
  view?: 'demo' | 'diagram';
};

export function ClaimChainEvidence({ view = 'demo' }: ClaimChainEvidenceProps) {
  const roles = [
    ['Provider', 'Submit claim + documents'],
    ['Administrator', 'Review + score + package'],
    ['Buyer', 'Purchase + entitled export'],
  ] as const;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  if (view === 'demo') {
    const playDemo = () => {
      const video = videoRef.current;
      if (!video) return;

      const playPromise = video.play();
      if (playPromise) {
        playPromise
          .then(() => video.focus())
          .catch(() => setHasStarted(false));
      }
    };

    return (
      <figure className={`${styles.artifact} ${styles.claimVideoArtifact}`}>
        <div className={styles.artifactHeader}>
          <span>ClaimChain demo</span>
          <strong>3:30 · prototype</strong>
        </div>
        <div className={styles.claimVideoStage}>
          <video
            ref={videoRef}
            className={styles.claimDemo}
            controls={hasStarted}
            playsInline
            preload="none"
            poster="/claimchain-demo-poster.webp"
            aria-label="ClaimChain product walkthrough using test data"
            onPlay={() => setHasStarted(true)}
          >
            <source src="/ClaimChain_Demo.mp4" type="video/mp4" />
            <a href="/ClaimChain_Demo.mp4">Open the ClaimChain demo video</a>.
          </video>
          {!hasStarted && (
            <button
              className={styles.claimPlayButton}
              type="button"
              onClick={playDemo}
              aria-label="Play the 3 minute 30 second ClaimChain product walkthrough"
            >
              <span aria-hidden="true">▶</span>
              Play demo
            </button>
          )}
        </div>
        <figcaption className={styles.visuallyHidden}>
          ClaimChain product walkthrough for an independent prototype using test data.
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className={`${styles.artifact} ${styles.claimArtifact}`}>
      <div className={styles.artifactHeader}>
        <span>ClaimChain workflow</span>
        <strong>Test-data prototype</strong>
      </div>
      <div className={styles.roleFlow}>
        {roles.map(([role, action], index) => (
          <div className={styles.roleNode} key={role}>
            <small>0{index + 1}</small>
            <strong>{role}</strong>
            <span>{action}</span>
          </div>
        ))}
      </div>
      <figcaption className={styles.authorityBand}>
        <div>
          <small>Backend authority</small>
          <strong>Eligibility · lifecycle · payment · export access</strong>
        </div>
        <p>ML may suggest packages. It cannot approve claims or grant access.</p>
      </figcaption>
    </figure>
  );
}

export function RyuEvidence({ priority = false }: EvidenceProps) {
  const stages = ['Services', 'NJ / NY scope', 'Validated request', 'Server email'];
  const pointerTypeRef = useRef<string | null>(null);
  const [engagement, setEngagement] = useState<'none' | 'keyboard' | 'touch'>('none');

  return (
    <figure className={`${styles.artifact} ${styles.ryuArtifact}`}>
      <div className={styles.artifactHeader}>
        <span>Ryu Legal production path</span>
        <strong>Live</strong>
      </div>
      <div className={`${styles.screenshotViewport} ${styles.ryuViewport}`}>
        <div
          className={styles.ryuScroller}
          data-engagement={engagement}
          role="region"
          aria-label="Scrollable full-page preview of the Ryu Legal production website"
          tabIndex={0}
          onBlur={() => {
            pointerTypeRef.current = null;
            setEngagement('none');
          }}
          onFocus={() => {
            const pointerType = pointerTypeRef.current;
            setEngagement(pointerType ? (pointerType === 'mouse' ? 'none' : 'touch') : 'keyboard');
            pointerTypeRef.current = null;
          }}
          onKeyDown={() => setEngagement('keyboard')}
          onPointerDown={(event) => {
            pointerTypeRef.current = event.pointerType;
            setEngagement(event.pointerType === 'mouse' ? 'none' : 'touch');
          }}
        >
          <Image
            src="/case-studies/ryu-home-full.webp"
            alt="Full Ryu Legal production homepage, from the opening practice overview through services, office information, and contact form"
            width={1248}
            height={3238}
            loading={priority ? 'eager' : 'lazy'}
            sizes="(max-width: 960px) 100vw, 52vw"
            className={styles.ryuLongScreenshot}
          />
        </div>
        <span className={styles.scrollCue} aria-hidden="true">
          Scroll preview
        </span>
        <div
          className={`${styles.deliveryFlow} ${styles.interactiveCaption}`}
          aria-hidden="true"
        >
          {stages.map((stage, index) => (
            <span key={stage}>
              <small>0{index + 1}</small>
              <strong>{stage}</strong>
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}

export function ProjectEvidence({
  project,
  priority = false,
  claimchainView = 'demo',
}: EvidenceProps & {
  claimchainView?: 'demo' | 'diagram';
  project: 'troa' | 'claimchain' | 'ryu-legal';
}) {
  if (project === 'troa') return <TroaEvidence priority={priority} />;
  if (project === 'claimchain') return <ClaimChainEvidence view={claimchainView} />;
  return <RyuEvidence priority={priority} />;
}
