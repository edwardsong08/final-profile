import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion';
import Image from 'next/image';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';

import styles from './ProjectEvidence.module.css';

type EvidenceProps = {
  priority?: boolean;
};

type DragScrollSession = {
  axis: 'pending' | 'horizontal' | 'vertical';
  lastTime: number;
  lastX: number;
  pointerId: number;
  pointerType: string;
  scrollTop: number;
  velocityX: number;
  x: number;
  y: number;
};

type HorizontalDragState = {
  distanceX: number;
  velocityX: number;
};

function handleVerticalScrollKey(
  event: ReactKeyboardEvent<HTMLDivElement>,
  scrollerRef: RefObject<HTMLDivElement | null>,
  prefersReducedMotion: boolean | null,
) {
  if (event.altKey || event.ctrlKey || event.metaKey) return false;

  const scroller = scrollerRef.current;
  if (!scroller) return false;

  const pageDistance = scroller.clientHeight * 0.82;
  let target: number | null = null;

  switch (event.key) {
    case 'ArrowUp':
      target = scroller.scrollTop - 64;
      break;
    case 'ArrowDown':
      target = scroller.scrollTop + 64;
      break;
    case 'PageUp':
      target = scroller.scrollTop - pageDistance;
      break;
    case 'PageDown':
      target = scroller.scrollTop + pageDistance;
      break;
    case ' ':
      target = scroller.scrollTop + (event.shiftKey ? -pageDistance : pageDistance);
      break;
    case 'Home':
      target = 0;
      break;
    case 'End':
      target = scroller.scrollHeight;
      break;
    default:
      return false;
  }

  event.preventDefault();
  scroller.scrollTo({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    top: target,
  });
  return true;
}

function useVerticalDragScroll(
  scrollerRef: RefObject<HTMLDivElement | null>,
  {
    allowTouchHorizontal = false,
    allowVerticalScroll = true,
    onHorizontalCancel,
    onHorizontalEnd,
    onHorizontalMove,
    onHorizontalStart,
    preserveHorizontalGesture = false,
  }: {
    allowTouchHorizontal?: boolean;
    allowVerticalScroll?: boolean;
    onHorizontalCancel?: () => void;
    onHorizontalEnd?: (state: HorizontalDragState) => void;
    onHorizontalMove?: (state: HorizontalDragState) => void;
    onHorizontalStart?: () => void;
    preserveHorizontalGesture?: boolean;
  } = {},
) {
  const sessionRef = useRef<DragScrollSession | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    if (
      !scroller
      || !event.isPrimary
      || (event.pointerType === 'touch' && !allowTouchHorizontal)
      || event.button !== 0
    ) return;

    const rect = scroller.getBoundingClientRect();
    const scrollbarWidth = scroller.offsetWidth - scroller.clientWidth;
    if (scrollbarWidth > 0 && event.clientX >= rect.right - scrollbarWidth - 2) return;

    sessionRef.current = {
      axis: 'pending',
      lastTime: event.timeStamp,
      lastX: event.clientX,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      scrollTop: scroller.scrollTop,
      velocityX: 0,
      x: event.clientX,
      y: event.clientY,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = sessionRef.current;
    const scroller = scrollerRef.current;
    if (!session || !scroller || session.pointerId !== event.pointerId) return;

    const distanceX = event.clientX - session.x;
    const distanceY = event.clientY - session.y;
    const absoluteX = Math.abs(distanceX);
    const absoluteY = Math.abs(distanceY);
    const elapsed = event.timeStamp - session.lastTime;

    if (elapsed > 0) {
      const instantaneousVelocity = ((event.clientX - session.lastX) / elapsed) * 1000;
      session.velocityX = session.velocityX * 0.6 + instantaneousVelocity * 0.4;
      session.lastTime = event.timeStamp;
      session.lastX = event.clientX;
    }

    if (session.axis === 'pending') {
      if (Math.max(absoluteX, absoluteY) < 11) return;

      const isVerticalIntent = allowVerticalScroll && (
        preserveHorizontalGesture
          ? absoluteY > absoluteX * 1.15
          : absoluteY >= absoluteX * 0.8
      );
      session.axis = isVerticalIntent ? 'vertical' : 'horizontal';

      if (session.axis === 'vertical') {
        if (session.pointerType === 'touch') {
          sessionRef.current = null;
          return;
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        setIsPanning(true);
      } else {
        event.currentTarget.setPointerCapture(event.pointerId);
        onHorizontalStart?.();
      }
    }

    if (session.axis === 'vertical') {
      event.preventDefault();
      scroller.scrollTop = session.scrollTop - distanceY;
    } else if (session.axis === 'horizontal') {
      event.preventDefault();
      onHorizontalMove?.({ distanceX, velocityX: session.velocityX });
    }
  };

  const releasePointer = (
    event: ReactPointerEvent<HTMLDivElement>,
    canceled: boolean,
  ) => {
    const session = sessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (session.axis === 'horizontal') {
      if (canceled) {
        onHorizontalCancel?.();
      } else {
        onHorizontalEnd?.({
          distanceX: event.clientX - session.x,
          velocityX: session.velocityX,
        });
      }
    }
    sessionRef.current = null;
    setIsPanning(false);
  };

  return {
    isPanning,
    onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => {
      releasePointer(event, true);
    },
    onPointerDown,
    onPointerMove,
    onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => {
      releasePointer(event, false);
    },
  };
}

const troaSites = [
  {
    id: 'public-platform',
    kind: 'image',
    label: 'V3 public platform',
    url: 'https://v3-preview.therealmsofasgard.com/',
    description: 'The upcoming public experience for community, advocacy, and service.',
    image: '/case-studies/troa-sites/v3-home-full.webp',
    height: 3274,
  },
  {
    id: 'careers',
    kind: 'image',
    label: 'Careers',
    url: 'https://careers.therealmsofasgard.com/',
    description: 'Open roles, organization context, applications, and applicant progress.',
    image: '/case-studies/troa-sites/careers-home-full.webp',
    height: 2665,
  },
  {
    id: 'ticketing',
    kind: 'image',
    label: 'Ticketing',
    url: 'https://tickets.therealmsofasgard.com/',
    description: 'Member support, moderation, resolution, and administration workflows.',
    image: '/case-studies/troa-sites/tickets-home-full.webp',
    height: 1021,
  },
  {
    id: 'learning-center',
    kind: 'image',
    label: 'Learning Center',
    url: 'https://courses.therealmsofasgard.com/',
    description: 'Training, courses, progress, credentials, and learning records.',
    image: '/case-studies/troa-sites/courses-home-full.webp',
    height: 1011,
  },
  {
    id: 'private-operations',
    kind: 'private',
    label: 'Private operations',
    url: null,
    description: 'Internal tools represented by operating scope—not private interfaces or data.',
    image: null,
    height: null,
  },
] as const;

export type TroaSlideId = (typeof troaSites)[number]['id'];

type TroaEvidenceProps = EvidenceProps & {
  onActiveSlideChange?: (slide: TroaSlideId) => void;
};

export function TroaEvidence({
  priority = false,
  onActiveSlideChange,
}: TroaEvidenceProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [engagement, setEngagement] = useState<'none' | 'keyboard' | 'touch'>('none');
  const [isDragging, setIsDragging] = useState(false);
  const pointerTypeRef = useRef<string | null>(null);
  const isSettlingRef = useRef(false);
  const settleFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const dragX = useMotionValue(0);
  const activeSite = troaSites[activeIndex];
  const previousIndex = (activeIndex - 1 + troaSites.length) % troaSites.length;
  const nextIndex = (activeIndex + 1) % troaSites.length;
  const visibleSites = [
    { site: troaSites[previousIndex], position: 'previous' },
    { site: activeSite, position: 'current' },
    { site: troaSites[nextIndex], position: 'next' },
  ] as const;

  useEffect(() => {
    onActiveSlideChange?.(activeSite.id);
  }, [activeSite.id, onActiveSlideChange]);

  useEffect(() => () => {
    if (settleFallbackRef.current) clearTimeout(settleFallbackRef.current);
  }, []);

  const selectPage = (index: number) => {
    if (index === activeIndex || isSettlingRef.current) return;
    dragX.set(0);
    scrollerRef.current?.scrollTo({ top: 0 });
    setEngagement('none');
    setActiveIndex(index);
  };

  const settlePage = (direction: -1 | 1) => {
    if (isSettlingRef.current) return;

    const width = scrollerRef.current?.clientWidth ?? 0;
    let selectionCompleted = false;
    const completeSelection = () => {
      if (selectionCompleted) return;
      selectionCompleted = true;
      if (settleFallbackRef.current) {
        clearTimeout(settleFallbackRef.current);
        settleFallbackRef.current = null;
      }
      flushSync(() => {
        setActiveIndex((index) => (
          index + direction + troaSites.length
        ) % troaSites.length);
        setEngagement('none');
      });
      dragX.set(0);
      scrollerRef.current?.scrollTo({ top: 0 });
      isSettlingRef.current = false;
    };

    isSettlingRef.current = true;
    if (!width || prefersReducedMotion) {
      completeSelection();
      return;
    }

    setIsDragging(false);
    settleFallbackRef.current = setTimeout(completeSelection, 700);
    const settleAnimation = animate(dragX, direction > 0 ? -width : width, {
      type: 'spring',
      stiffness: 420,
      damping: 38,
      mass: 0.82,
      restDelta: 0.5,
      restSpeed: 4,
    });
    settleAnimation.then(completeSelection, completeSelection);
  };

  const returnToCenter = () => {
    if (prefersReducedMotion) {
      dragX.set(0);
      return;
    }

    animate(dragX, 0, {
      type: 'spring',
      stiffness: 500,
      damping: 36,
      mass: 0.8,
    });
  };

  const verticalDragScroll = useVerticalDragScroll(scrollerRef, {
    allowTouchHorizontal: true,
    onHorizontalCancel: () => {
      setIsDragging(false);
      returnToCenter();
    },
    onHorizontalEnd: ({ distanceX, velocityX }) => {
      setIsDragging(false);
      if (isSettlingRef.current) return;

      const width = scrollerRef.current?.clientWidth ?? 0;
      const threshold = Math.max(44, Math.min(72, width * 0.12));
      const projectedDistance = Math.abs(distanceX) >= 24
        ? distanceX + velocityX * 0.08
        : distanceX;

      if (Math.abs(projectedDistance) >= threshold) {
        settlePage(projectedDistance < 0 ? 1 : -1);
      } else {
        returnToCenter();
      }
    },
    onHorizontalMove: ({ distanceX }) => {
      if (isSettlingRef.current) return;

      const width = scrollerRef.current?.clientWidth ?? 0;
      if (!width) return;

      const absoluteDistance = Math.abs(distanceX);
      const resistedDistance = absoluteDistance <= width
        ? distanceX
        : Math.sign(distanceX) * (width + (absoluteDistance - width) * 0.16);
      dragX.set(resistedDistance);
    },
    onHorizontalStart: () => {
      if (isSettlingRef.current) return;
      dragX.stop();
      setIsDragging(true);
    },
    preserveHorizontalGesture: true,
  });

  return (
    <figure className={styles.troaEvidence}>
      <div className={`${styles.artifact} ${styles.troaArtifact}`}>
        <div
          className={styles.troaFrameStage}
          data-dragging={isDragging ? 'true' : 'false'}
          data-engagement={engagement}
          data-panning={verticalDragScroll.isPanning ? 'true' : 'false'}
        >
          <motion.div
            className={styles.troaDragSurface}
            style={{ x: dragX }}
          >
            <div className={styles.troaSlideTrack}>
              {visibleSites.map(({ site, position }) => {
                const isCurrent = position === 'current';

                return (
                  <div
                    className={styles.troaSlidePanel}
                    key={position}
                    aria-hidden={isCurrent ? undefined : 'true'}
                  >
                    <div
                      className={styles.troaScroller}
                      data-engagement={isCurrent ? engagement : 'none'}
                      role={isCurrent ? 'region' : undefined}
                      aria-label={isCurrent
                        ? activeSite.kind === 'image'
                          ? `Scrollable preview of the TROA ${activeSite.label} homepage. Scroll or drag vertically to explore; drag horizontally or use Left and Right Arrow keys to change sites.`
                          : 'Overview of TROA private operating systems. Drag horizontally or use Left and Right Arrow keys to change sites.'
                        : undefined}
                      tabIndex={isCurrent ? 0 : -1}
                      ref={isCurrent ? scrollerRef : undefined}
                      onBlur={isCurrent ? () => {
                        pointerTypeRef.current = null;
                        setEngagement('none');
                      } : undefined}
                      onFocus={isCurrent ? () => {
                        const pointerType = pointerTypeRef.current;
                        setEngagement(pointerType ? (pointerType === 'mouse' ? 'none' : 'touch') : 'keyboard');
                        pointerTypeRef.current = null;
                      } : undefined}
                      onKeyDown={isCurrent ? (event) => {
                        setEngagement('keyboard');
                        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                          event.preventDefault();
                          settlePage(event.key === 'ArrowLeft' ? -1 : 1);
                        } else {
                          handleVerticalScrollKey(event, scrollerRef, prefersReducedMotion);
                        }
                      } : undefined}
                      onPointerDown={isCurrent ? (event) => {
                        if (!event.isPrimary) return;
                        pointerTypeRef.current = event.pointerType;
                        setEngagement(event.pointerType === 'mouse' ? 'none' : 'touch');
                        verticalDragScroll.onPointerDown(event);
                      } : undefined}
                      onPointerMove={isCurrent
                        ? verticalDragScroll.onPointerMove
                        : undefined}
                      onPointerUp={isCurrent
                        ? verticalDragScroll.onPointerUp
                        : undefined}
                      onPointerCancel={isCurrent
                        ? verticalDragScroll.onPointerCancel
                        : undefined}
                    >
                      <div className={styles.troaImageSlide}>
                        {site.kind === 'image' ? (
                          <Image
                          src={site.image}
                          alt={isCurrent
                            ? `TROA ${site.label} homepage showing ${site.description}`
                            : ''}
                    width={1218}
                          height={site.height}
                          loading={priority || isCurrent ? 'eager' : 'lazy'}
                    sizes="(max-width: 960px) 100vw, 58vw"
                    className={styles.troaLongScreenshot}
                    draggable={false}
                          />
                        ) : (
                          <div
                            className={styles.troaPrivateSurface}
                            role={isCurrent ? 'img' : undefined}
                            aria-label={isCurrent
                              ? 'Private TROA operating systems represented without interfaces or data: people and volunteers, finance and reporting, legal and compliance, and support and administration. Shared identity, role-scoped access, server-side privileges, and audit history form the control foundation.'
                              : undefined}
                          >
                            <div className={styles.troaPrivateHeading}>
                              <small>Internal operating systems</small>
                              <strong>Scope shown. Interfaces withheld.</strong>
                            </div>
                            <div className={styles.troaPrivateIndex} aria-hidden="true">
                              <div>
                                <strong>People &amp; volunteers</strong>
                                <span>Onboarding · records · roles</span>
                              </div>
                              <div>
                                <strong>Finance &amp; reporting</strong>
                                <span>Hours · approvals · recurring reports</span>
                              </div>
                              <div>
                                <strong>Legal &amp; compliance</strong>
                                <span>Policies · records · review</span>
                              </div>
                              <div>
                                <strong>Support &amp; administration</strong>
                                <span>Cases · permissions · governance</span>
                              </div>
                              <div className={styles.troaControlRow}>
                                <strong>Control foundation</strong>
                                <span>Shared identity · role-scoped access · server authority · audit history</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
          {activeSite.kind === 'image' && (
            <span className={styles.scrollCue} aria-hidden="true">
              Scroll
            </span>
          )}
        </div>
        {activeSite.kind === 'image' && (
          <div
            className={`${styles.troaSurfaceCaption} ${styles.interactiveCaption}`}
            aria-hidden="true"
          >
            <small>{activeSite.label}</small>
            <strong>{activeSite.description}</strong>
          </div>
        )}
      </div>
      <nav className={styles.troaPager} aria-label="TROA ecosystem previews">
        <button
          className={styles.troaPagerArrow}
          type="button"
          onClick={() => settlePage(-1)}
          aria-label="Show previous TROA site"
        >
          <span aria-hidden="true">←</span>
        </button>
        <div className={styles.troaDots}>
          {troaSites.map((site, index) => (
            <button
              className={styles.troaDot}
              type="button"
              key={site.url}
              onClick={() => selectPage(index)}
              aria-label={`Show TROA ${site.label}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              title={site.label}
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </div>
        <button
          className={styles.troaPagerArrow}
          type="button"
          onClick={() => settlePage(1)}
          aria-label="Show next TROA site"
        >
          <span aria-hidden="true">→</span>
        </button>
      </nav>
      <figcaption className={styles.visuallyHidden}>
        TROA {activeSite.label}: {activeSite.description}
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
              Play demo · 3:30
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const verticalDragScroll = useVerticalDragScroll(scrollerRef);
  const prefersReducedMotion = useReducedMotion();
  const [engagement, setEngagement] = useState<'none' | 'keyboard' | 'touch'>('none');

  return (
    <figure className={`${styles.artifact} ${styles.ryuArtifact}`}>
      <div
        className={`${styles.screenshotViewport} ${styles.ryuViewport}`}
        data-engagement={engagement}
      >
        <div
          className={styles.ryuScroller}
          data-engagement={engagement}
          data-panning={verticalDragScroll.isPanning ? 'true' : 'false'}
          role="region"
          aria-label="Scrollable full-page preview of the Ryu Legal production website. Scroll or drag vertically to explore."
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
          onKeyDown={(event) => {
            setEngagement('keyboard');
            handleVerticalScrollKey(event, scrollerRef, prefersReducedMotion);
          }}
          onPointerDown={(event) => {
            pointerTypeRef.current = event.pointerType;
            setEngagement(event.pointerType === 'mouse' ? 'none' : 'touch');
            verticalDragScroll.onPointerDown(event);
          }}
          onPointerMove={verticalDragScroll.onPointerMove}
          onPointerUp={verticalDragScroll.onPointerUp}
          onPointerCancel={verticalDragScroll.onPointerCancel}
        >
          <Image
            src="/case-studies/ryu-home-full.webp"
            alt="Full Ryu Legal production homepage, from the opening practice overview through services, office information, and contact form"
            width={1218}
            height={4386}
            loading={priority ? 'eager' : 'lazy'}
            sizes="(max-width: 960px) 100vw, 52vw"
            className={styles.ryuLongScreenshot}
            draggable={false}
          />
        </div>
        <span className={styles.scrollCue} aria-hidden="true">
          Scroll
        </span>
      </div>
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
    </figure>
  );
}

export function ProjectEvidence({
  project,
  priority = false,
  claimchainView = 'demo',
  onTroaSlideChange,
}: EvidenceProps & {
  claimchainView?: 'demo' | 'diagram';
  onTroaSlideChange?: (slide: TroaSlideId) => void;
  project: 'troa' | 'claimchain' | 'ryu-legal';
}) {
  if (project === 'troa') {
    return (
      <TroaEvidence
        priority={priority}
        onActiveSlideChange={onTroaSlideChange}
      />
    );
  }
  if (project === 'claimchain') return <ClaimChainEvidence view={claimchainView} />;
  return <RyuEvidence priority={priority} />;
}
