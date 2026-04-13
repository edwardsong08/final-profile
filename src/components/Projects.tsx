import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import ProjectModal from './ProjectModal';
import VideoModal from './VideoModal';

type Project = {
  title: string;
  shortDescription: string;
  fullDescription: string;
  link?: string;
  liveDemoLink?: string;
  roadmapLink?: string;
  demoVideoSrc?: string;
  demoDuration?: string;
  status: 'live' | 'livedemo' | 'demo' | 'progress' | 'inprogress';
  hidden?: boolean;
  variant?: 'spotlight' | 'feature' | 'standard';
  note?: string;
  icon?: string;
};

const projects: Project[] = [
  {
    title: 'ClaimChain — Claims Exchange Platform + Advisory ML',
    shortDescription:
      'Production-style claims exchange platform with Provider/Buyer/Admin workflows, approval gates, claim intake, document upload, explainable rules-based scoring, package curation, anonymized buyer views, purchase entitlements, PDF export, and advisory ML integration.',
    fullDescription: `ClaimChain is a production-style claims exchange platform for unpaid service and debt claims. Service providers submit claims and supporting documents, admins review and approve them through controlled workflows, and buyers browse anonymized packages that can be purchased and exported through entitlement-aware flows.

The current build already covers the full core pipeline across all three roles. Providers have onboarding, profile management, claim submission, and status tracking. Admins have approval queues, claim review, ruleset-driven scoring, package curation, listing controls, override paths, and audit visibility. Buyers have onboarding, marketplace browsing for listed packages, post-purchase detail views, and PDF export for purchased packages.

What makes the project stronger from an engineering perspective is that the backend remains authoritative. Scoring is explainable and rules-based, packaging eligibility is enforced server-side, buyer-facing package views are anonymized, and sensitive actions are captured through audit trails. The result is a system built around workflow integrity and business-rule enforcement rather than simple CRUD screens.

ClaimChain also includes an advisory ML layer designed with safe boundaries. The ML service can help suggest package compositions, but it does not override approval decisions, scoring rules, or packaging constraints. That separation was intentional so the platform can incorporate machine learning without sacrificing explainability, control, or operational safety.

Tech stack: Java 17, Spring Boot, PostgreSQL, Flyway, JWT auth with RBAC, Docker, Next.js, TypeScript, Tailwind CSS, FastAPI, Python 3.12, GitHub Actions, AWS deployment patterns, and PDF export workflows.`,
    icon: '/icons/claimchain.png',
    link: 'https://github.com/edwardsong08/ClaimChain',
    liveDemoLink: 'https://claimchain-tan.vercel.app',
    demoVideoSrc: '/ClaimChain_Demo.mp4',
    demoDuration: '3:30',
    status: 'live',
    variant: 'spotlight',
  },
  {
    title: 'TROA — Platform Ecosystem',
    shortDescription:
      'Sole developer across TROA’s public site and operational platform work, including a custom admin portal, career portal, ticketing workflows, Gemini chatbot, security hardening, SEO, and internal volunteer-hours/reporting systems.',
    fullDescription:
      'TROA is a real nonprofit/community platform where I currently serve as the sole developer. My work spans the public site, custom admin tooling, career portal, ticketing flows, Discord support/security improvements, and a Go-based Gemini chatbot.\n\nThis work is stronger as featured experience than as a traditional demo project because much of the operational value lives in internal tools and workflows that are not appropriate to show publicly.\n\nSelected contributions include rebuilding major platform surfaces in React/Next.js and Supabase, resolving ~130 Supabase issues, improving SEO and performance to 95+ Lighthouse scores, shipping volunteer-hours logging plus manual/automated finance reporting, and stabilizing cross-stack issues spanning repo code, Cloudflare, Coolify, and server infrastructure.\n\nPublic-facing live site available; internal admin and operational tooling intentionally not shown for privacy and platform security reasons.',
    icon: '/icons/troa-helm.png',
    liveDemoLink: 'https://therealmsofasgard.com',
    status: 'live',
    variant: 'feature',
  },
  {
    title: 'Ryu-Legal.com – Law Firm Website',
    shortDescription:
      'A single-page professional law firm website built with Next.js, Tailwind, Framer Motion, and Resend. Features responsive design, animated UI, and SEO optimization for legal services in NJ & NY.',
    fullDescription:
      'A single-page professional law firm website built with Next.js, Tailwind, Framer Motion, and Resend. Features responsive design, animated UI, and SEO optimization for legal services in NJ & NY.',
    icon: '/icons/soominryu.png',
    link: 'https://www.ryu-legal.com',
    status: 'live',
    variant: 'standard',
  },
  {
    title: 'Blockchain Ledger Proof-of-Concept (Java + AWS)',
    shortDescription:
      'Simulated blockchain ledger built with Spring Boot, PostgreSQL, and Docker. Completed in one week as a proof-of-concept for full-stack Java development and rapid learning.',
    fullDescription:
      'Simulated blockchain ledger built with Spring Boot, PostgreSQL, and Docker. Completed in one week as a proof-of-concept for full-stack Java development and rapid learning.\n\nThis project simulates a blockchain-based transaction ledger and was completed in about one week without prior knowledge of Java, Spring Boot, or blockchain. It demonstrates my ability to rapidly learn and integrate multiple enterprise-grade technologies.\n\nThe app was built with Spring Boot (REST + Thymeleaf UI), PostgreSQL, and Docker. Data access combines Spring Data JPA with MyBatis for both standard and complex queries. It includes an immutable audit trail that logs transaction creation, updates, and deletions — simulating blockchain behavior.\n\nThe system supports English and Korean, has robust input validation and error handling, and features a full CI/CD pipeline via GitHub Actions. For deployment, the backend runs in Docker containers on AWS EC2 with an AWS RDS database.',
    icon: '/icons/vzwledger.png',
    link: 'https://github.com/edwardsong08/vzw-transaction-ledger',
    status: 'livedemo',
    liveDemoLink: 'http://18.117.137.143/dashboard',
    variant: 'standard',
  },
  {
    title: 'OpenBid — Full-Stack Prototype (React + Django)',
    shortDescription:
      'A real estate bidding platform prototype with a polished React frontend, Django REST backend, and live authentication flows. Deployed with Vercel (frontend), Render (backend), and Supabase Postgres.',
    fullDescription:
      'A real estate bidding platform prototype with a polished React frontend, Django REST backend, and live authentication flows.\n\nThe frontend is built with modern React (Hooks, functional components, Tailwind UI) and includes polished user flows for login, signup, and password reset. Form validation and UX details are implemented to feel production-ready.\n\nThe backend is powered by Django + Django REST Framework and provides secure API endpoints for authentication and user management.\n\nDeployment: the frontend is hosted on Vercel, the backend API is hosted on Render, and the database was migrated from SQLite to PostgreSQL on Supabase to support a real production-style environment.\n\nWhile core bidding features are not fully implemented yet, the codebase demonstrates a clean structure for scaling into listings, bids, admin controls, and more.',
    link: 'https://github.com/edwardsong08/realestatebidding',
    status: 'progress',
    liveDemoLink: 'https://realestatebidding.vercel.app',
    hidden: true,
    variant: 'standard',
  },
  {
    title: 'Full-Stack Developer Portfolio',
    shortDescription:
      'A personal site built from scratch to showcase my work, skills, and background. Built with Next.js, Tailwind, and Framer Motion, with responsive design and animated transitions.',
    fullDescription:
      'A personal site built from scratch to showcase my work, skills, and background. Built with Next.js, Tailwind, and Framer Motion, with responsive design and animated transitions.',
    link: 'https://github.com/edwardsong08/final-profile',
    status: 'live',
    hidden: true,
    variant: 'standard',
  },
];

export default function Projects() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{
    title: string;
    description: string;
    link?: string;
    liveDemoLink?: string;
    roadmapLink?: string;
    demoVideoSrc?: string;
    demoDuration?: string;
  } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{
    title: string;
    videoSrc: string;
    demoDuration?: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';
  const sectionText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const sectionOverlay = isDark ? 'bg-black/60' : 'bg-[rgba(242,236,226,0.82)]';
  const headerSurface = isDark
    ? 'bg-zinc-800 border-b border-zinc-700 shadow-[0_1px_0_rgba(255,255,255,0.04)]'
    : 'bg-stone-300 border-b border-stone-400 shadow-[0_1px_0_rgba(255,255,255,0.55)]';
  const spotlightCardBg = isDark
    ? 'bg-zinc-900/80 border-white/14 shadow-[0_18px_40px_rgba(0,0,0,0.42)]'
    : 'bg-stone-200 border-stone-300 shadow-[0_14px_30px_rgba(41,37,36,0.12)]';
  const featureCardBg = isDark
    ? 'bg-zinc-900/80 border-white/14 shadow-[0_14px_34px_rgba(0,0,0,0.36)]'
    : 'bg-stone-200 border-stone-300 shadow-[0_12px_26px_rgba(41,37,36,0.10)]';
  const supportingCardBg = isDark
    ? 'bg-zinc-900/80 border-white/14 shadow-[0_10px_24px_rgba(0,0,0,0.30)]'
    : 'bg-stone-200 border-stone-300 shadow-[0_10px_22px_rgba(41,37,36,0.09)]';
  const descriptionText = isDark ? 'text-zinc-300' : 'text-zinc-700';
  const subtitleText = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const noteText = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const iconBadgeSurface = isDark ? 'bg-black/16 border-white/8' : 'bg-stone-100/56 border-stone-300/60';

  const statusMap: Record<string, { label: string; color: string }> = {
    live: { label: 'LIVE', color: 'bg-green-500' },
    livedemo: { label: 'Live Demo', color: 'bg-green-500' },
    demo: { label: 'Request Demo', color: 'bg-yellow-400' },
    progress: { label: 'In Progress (Live Demo)', color: 'bg-yellow-400' },
    inprogress: { label: 'In Progress', color: 'bg-yellow-400' }, // ✅ new
  };

  const visibleProjects = projects.filter((project) => !project.hidden);
  const spotlightProject = visibleProjects.find((project) => project.variant === 'spotlight');
  const featureProjects = visibleProjects.filter((project) => project.variant === 'feature');
  const supportingProjects = visibleProjects.filter(
    (project) => project.variant !== 'spotlight' && project.variant !== 'feature'
  );

  const openProjectDetails = (project: Project) => {
    setSelectedProject({
      title: project.title,
      description: project.fullDescription,
      link: project.link,
      liveDemoLink: project.liveDemoLink,
      roadmapLink: project.roadmapLink,
      demoVideoSrc: project.demoVideoSrc,
      demoDuration: project.demoDuration,
    });
  };

  const openDemoVideo = (project: Pick<Project, 'title' | 'demoVideoSrc' | 'demoDuration'>) => {
    if (!project.demoVideoSrc) return;

    setSelectedVideo({
      title: project.title,
      videoSrc: project.demoVideoSrc,
      demoDuration: project.demoDuration,
    });
  };

  const renderActions = (project: Project, isExpandable: boolean, alignStart = false) => (
    <div className={`mt-4 flex flex-col ${alignStart ? 'items-start' : 'items-end'} gap-2`}>
      {isExpandable && (
        <button
          onClick={() => openProjectDetails(project)}
          className="text-blue-400 text-sm underline hover:text-blue-500"
        >
          See More
        </button>
      )}

      {project.liveDemoLink && (
        <a
          href={project.liveDemoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-400 hover:text-blue-500 text-sm"
        >
          Visit Site <FaExternalLinkAlt className="ml-2" />
        </a>
      )}

      {project.roadmapLink && (
        <a
          href={project.roadmapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-400 hover:text-blue-500 text-sm"
        >
          Roadmap <FaExternalLinkAlt className="ml-2" />
        </a>
      )}

      {project.link && (
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-400 hover:text-blue-500 text-sm"
        >
          {project.title === 'Ryu-Legal.com – Law Firm Website' ? 'Visit Site' : 'View GitHub Repository'}{' '}
          <FaExternalLinkAlt className="ml-2" />
        </a>
      )}
    </div>
  );

  const renderProjectTitle = (project: Project, titleClassName: string) => (
    <div className="mb-4 flex items-start gap-2.5">
      {project.icon && (
        <span
          aria-hidden="true"
          className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${iconBadgeSurface}`}
        >
          <Image src={project.icon} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
        </span>
      )}
      <h3 className={titleClassName}>{project.title}</h3>
    </div>
  );

  return (
    <section className={`relative overflow-hidden transition-colors duration-300 ${sectionText}`}>
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/sectionsbackground.webp')" }}
      />
      <div className={`absolute inset-0 z-0 ${sectionOverlay}`} />

      <div className="relative z-10">
        <div className={`${headerSurface} py-8 transition-colors duration-300`}>
          <h2 className="text-4xl font-bold text-center">Featured Work</h2>
          <p className={`text-center mt-2 text-sm ${subtitleText}`}>
            Selected production work, platform ownership, and systems-focused builds.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-16 space-y-8">
          {spotlightProject && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`transition-colors duration-300 ${spotlightCardBg} p-7 sm:p-8 rounded-3xl border backdrop-blur-sm hover:shadow-lg hover:shadow-purple-400/40 transition-transform transform hover:scale-[1.01] flex flex-col`}
            >
              <div className="mb-4 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${statusMap[spotlightProject.status].color}`} />
                <span className="text-sm font-medium opacity-80">{statusMap[spotlightProject.status].label}</span>
              </div>

              {renderProjectTitle(spotlightProject, 'text-2xl sm:text-3xl font-semibold')}
              <p className={`${descriptionText} text-base sm:text-lg leading-relaxed`}>
                {spotlightProject.shortDescription}
              </p>
              {spotlightProject.note && (
                <p className={`mt-3 text-xs italic ${noteText}`}>{spotlightProject.note}</p>
              )}
              {spotlightProject.demoVideoSrc && (
                <button
                  type="button"
                  onClick={() => openDemoVideo(spotlightProject)}
                  className="group mt-4 w-full max-w-2xl self-center lg:max-w-[38rem] overflow-hidden rounded-2xl border border-white/15 text-left shadow-[0_10px_26px_rgba(0,0,0,0.24)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(0,0,0,0.32)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
                  aria-label="Watch ClaimChain demo video"
                >
                  <div className="relative w-full aspect-video overflow-hidden">
                    <Image
                      src="/claimchain-demo-poster.webp"
                      alt="ClaimChain demo preview"
                      fill
                      sizes="(min-width: 1024px) 42rem, (min-width: 640px) 80vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/10 transition-colors duration-300 group-hover:from-black/65 group-hover:via-black/40 group-hover:to-black/25" />

                    <div className="absolute left-3 top-3 z-10 rounded-full border border-white/30 bg-black/45 px-3 py-1 text-[11px] font-medium tracking-wide text-zinc-100">
                      Demo Video • {spotlightProject.demoDuration ?? '3:30'}
                    </div>

                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-black/35">
                        <span
                          aria-hidden="true"
                          className="ml-1 block h-0 w-0 border-y-[9px] border-y-transparent border-l-[14px] border-l-white"
                        />
                      </div>
                    </div>

                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 opacity-0 transition-all duration-250 group-hover:bg-black/35 group-hover:opacity-100">
                      <span className="rounded-md border border-white/45 bg-black/45 px-4 py-2 text-sm font-semibold tracking-wide text-white">
                        Watch Demo
                      </span>
                    </div>
                  </div>
                </button>
              )}
              {renderActions(
                spotlightProject,
                spotlightProject.fullDescription !== spotlightProject.shortDescription
              )}
            </motion.div>
          )}

          {featureProjects.map((project) => {
            const statusData = statusMap[project.status];
            const isExpandable = project.fullDescription !== project.shortDescription;

            return (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className={`transition-colors duration-300 ${featureCardBg} p-7 rounded-2xl border backdrop-blur-[2px] hover:shadow-lg hover:shadow-purple-400/40 transition-transform transform hover:scale-[1.01] flex flex-col`}
              >
                {statusData && (
                  <div className="mb-4 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${statusData.color}`} />
                    <span className="text-sm font-medium opacity-80">{statusData.label}</span>
                  </div>
                )}

                {renderProjectTitle(project, 'text-2xl font-semibold')}
                <p className={`${descriptionText} flex-grow`}>{project.shortDescription}</p>
                {renderActions(project, isExpandable)}
              </motion.div>
            );
          })}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {supportingProjects.map((project) => {
              const statusData = statusMap[project.status];
              const isExpandable = project.fullDescription !== project.shortDescription;

              return (
                <div
                  key={project.title}
                  className={`transition-colors duration-300 ${supportingCardBg} p-6 rounded-2xl border backdrop-blur-[2px] hover:shadow-lg hover:shadow-purple-400/40 transition-transform transform hover:scale-103 flex flex-col`}
                >
                  {statusData && (
                    <div className="mb-4 flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${statusData.color}`} />
                      <span className="text-sm font-medium opacity-80">{statusData.label}</span>
                    </div>
                  )}

                  {renderProjectTitle(project, 'text-xl font-semibold')}
                  <p className={`${descriptionText} flex-grow`}>{project.shortDescription}</p>
                  {renderActions(project, isExpandable)}
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {selectedProject && (
        <ProjectModal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.title}
          paragraphs={selectedProject.description.split('\n\n')}
          link={selectedProject.link}
          liveDemoLink={selectedProject.liveDemoLink}
          roadmapLink={selectedProject.roadmapLink}
          demoVideoSrc={selectedProject.demoVideoSrc}
          demoDuration={selectedProject.demoDuration}
          onWatchDemo={
            selectedProject.demoVideoSrc
              ? () => {
                  openDemoVideo({
                    title: selectedProject.title,
                    demoVideoSrc: selectedProject.demoVideoSrc,
                    demoDuration: selectedProject.demoDuration,
                  });
                  setSelectedProject(null);
                }
              : undefined
          }
        />
      )}

      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          title={selectedVideo.title}
          label={`Demo Video • ${selectedVideo.demoDuration ?? '3:30'}`}
          videoSrc={selectedVideo.videoSrc}
        />
      )}
    </section>
  );
}
