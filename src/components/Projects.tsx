import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import ProjectModal from './ProjectModal';

const projects = [
  {
    title: 'Full-Stack Developer Portfolio',
    shortDescription:
      'A personal site built from scratch to showcase my work, skills, and background. Built with Next.js, Tailwind, and Framer Motion, with responsive design and animated transitions.',
    fullDescription:
      'A personal site built from scratch to showcase my work, skills, and background. Built with Next.js, Tailwind, and Framer Motion, with responsive design and animated transitions.',
    link: 'https://github.com/edwardsong08/final-profile',
    status: 'live',
  },
  {
    title: 'Ryu-Legal.com – Law Firm Website',
    shortDescription:
      'A single-page professional law firm website built with Next.js, Tailwind, Framer Motion, and Resend. Features responsive design, animated UI, and SEO optimization for legal services in NJ & NY.',
    fullDescription:
      'A single-page professional law firm website built with Next.js, Tailwind, Framer Motion, and Resend. Features responsive design, animated UI, and SEO optimization for legal services in NJ & NY.',
    link: 'https://www.ryu-legal.com',
    status: 'live',
  },
  {
    title: 'Blockchain Ledger Proof-of-Concept (Java + AWS)',
    shortDescription:
      'Simulated blockchain ledger built with Spring Boot, PostgreSQL, and Docker. Completed in one week as a proof-of-concept for full-stack Java development and rapid learning.',
    fullDescription:
      'Simulated blockchain ledger built with Spring Boot, PostgreSQL, and Docker. Completed in one week as a proof-of-concept for full-stack Java development and rapid learning.\n\nThis project simulates a blockchain-based transaction ledger and was completed in about one week without prior knowledge of Java, Spring Boot, or blockchain. It demonstrates my ability to rapidly learn and integrate multiple enterprise-grade technologies.\n\nThe app was built with Spring Boot (REST + Thymeleaf UI), PostgreSQL, and Docker. Data access combines Spring Data JPA with MyBatis for both standard and complex queries. It includes an immutable audit trail that logs transaction creation, updates, and deletions — simulating blockchain behavior.\n\nThe system supports English and Korean, has robust input validation and error handling, and features a full CI/CD pipeline via GitHub Actions. For deployment, the backend runs in Docker containers on AWS EC2 with an AWS RDS database.',
    link: 'https://github.com/edwardsong08/vzw-transaction-ledger',
    status: 'livedemo',
    liveDemoLink: 'http://18.117.137.143/dashboard',
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
  },

  // ✅ NEW PROJECT
  {
    title: 'ClaimChain — Full-Stack Claims Exchange Platform',
    shortDescription:
      'Production-grade claims exchange platform with multi-role dashboards (Provider/Buyer/Admin), evidence uploads, document ingestion with parsing/OCR, explainable risk scoring, and anonymized portfolio packaging for marketplace purchase.',
    fullDescription:
      'ClaimChain is a full-stack, production-grade claims exchange platform that enables service providers to submit unpaid work claims with supporting documentation, undergo verification and review, receive explainable risk scoring, and package claims into anonymized portfolios that vetted collection agencies or debt buyers can purchase through a secure marketplace.\n\nThe platform delivers an end-to-end workflow system: role-based identity and access (Provider / Buyer / Admin), secure evidence upload and storage (S3-compatible), document ingestion with parsing + OCR and robust job status tracking, an admin review queue with controlled lifecycle state transitions and feedback notes, and auditable event trails across key actions (submissions, review decisions, purchases, and exports).\n\nRisk scoring combines deterministic rules with explainability (reasons + weighted factors) and an ML augmentation layer for improved prediction and portfolio ranking, including model versioning and safe fallback behavior. Claims are grouped into anonymized packages with portfolio analytics and buyer filtering, followed by a secure checkout and purchase flow (Stripe) and post-purchase export/download with access-controlled deliverables.\n\nWeb dashboards are available for each role (Provider / Buyer / Admin), and a mobile companion app supports provider claim submission, camera capture + document uploads, status tracking, and notifications, with Android distribution via APK and iOS distribution via TestFlight.\n\nTech stack: Java 17 + Spring Boot (Security, Data JPA, Validation), PostgreSQL (Docker locally; AWS-ready deployment), JWT auth + RBAC, Apache Tika + OCR support, S3-compatible storage, background job processing for ingestion/scoring, a TypeScript + Next.js web client, CI/CD via GitHub Actions, and production-style observability hooks (structured logging, metrics, and job monitoring).',
    link: 'https://github.com/edwardsong08/ClaimChain',
    roadmapLink:
      'https://www.notion.so/1c1f23bf2a918007b076e6ba6f67b891?v=312f23bf2a9180e690b0000c9d34a6a9&p=312f23bf2a9180279afec4e4225ad016&pm=s',
    status: 'inprogress',
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
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';
  const bgSection = isDark ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-100 text-zinc-900';
  const bgHeader = isDark ? 'bg-zinc-900' : 'bg-zinc-200';
  const cardBg = isDark ? 'bg-zinc-700' : 'bg-zinc-200';
  const descriptionText = isDark ? 'text-zinc-300' : 'text-zinc-700';

  const statusMap: Record<string, { label: string; color: string }> = {
    live: { label: 'LIVE', color: 'bg-green-500' },
    livedemo: { label: 'Live Demo', color: 'bg-green-500' },
    demo: { label: 'Request Demo', color: 'bg-yellow-400' },
    progress: { label: 'In Progress (Live Demo)', color: 'bg-yellow-400' },
    inprogress: { label: 'In Progress', color: 'bg-yellow-400' }, // ✅ new
  };

  return (
    <section id="projects" className={`${bgSection} transition-colors duration-300`}>
      <div className={`${bgHeader} py-8 transition-colors duration-300`}>
        <h2 className="text-4xl font-bold text-center">Projects</h2>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 px-4"
        >
          {projects.map(
            ({ title, shortDescription, fullDescription, link, status, liveDemoLink, roadmapLink }) => {
              const statusData = statusMap[status];
              const isExpandable = fullDescription !== shortDescription;

              return (
                <div
                  key={title}
                  className={`transition-colors duration-300 ${cardBg} p-6 rounded-2xl shadow-md hover:shadow-lg hover:shadow-purple-400/40 transition-transform transform hover:scale-103 flex flex-col`}
                >
                  {statusData && (
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${statusData.color}`} />
                      <span className="text-sm font-medium opacity-80">{statusData.label}</span>
                    </div>
                  )}

                  <h3 className="text-xl font-semibold mb-4">{title}</h3>
                  <p className={`${descriptionText} flex-grow`}>
                    {shortDescription}
                    {isExpandable && (
                      <>
                        {' '}
                        <button
                          onClick={() =>
                            setSelectedProject({
                              title,
                              description: fullDescription,
                              link,
                              liveDemoLink,
                              roadmapLink,
                            })
                          }
                          className="text-blue-400 text-sm underline hover:text-blue-500 inline"
                        >
                          See More
                        </button>
                      </>
                    )}
                  </p>

                  <div className="mt-4 flex flex-col items-end gap-2">
                    {liveDemoLink && (
                      <a
                        href={liveDemoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-400 hover:text-blue-500 text-sm"
                      >
                        Visit Site <FaExternalLinkAlt className="ml-2" />
                      </a>
                    )}

                    {roadmapLink && (
                      <a
                        href={roadmapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-400 hover:text-blue-500 text-sm"
                      >
                        Roadmap <FaExternalLinkAlt className="ml-2" />
                      </a>
                    )}

                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-400 hover:text-blue-500 text-sm"
                      >
                        {title === 'Ryu-Legal.com – Law Firm Website'
                          ? 'Visit Site'
                          : 'View GitHub Repository'}{' '}
                        <FaExternalLinkAlt className="ml-2" />
                      </a>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </motion.div>
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
        />
      )}
    </section>
  );
}