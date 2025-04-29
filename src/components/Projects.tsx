// src/components/Projects.tsx
import { motion } from 'framer-motion';
import { FaExternalLinkAlt } from 'react-icons/fa';

const projects = [
  {
    title: 'Developer Profile Page (In Progress)',
    description:
      'A personal site built from scratch to showcase my work, skills, and background. Built with Next.js, Tailwind, and Framer Motion, with responsive design and animated transitions.',
  },
  {
    title: 'Ryu-Legal.com – Law Firm Website',
    description:
      'A live website for a real estate law firm built using Next.js, Tailwind, Framer Motion, and Resend API. Optimized for SEO and responsive across devices.',
    link: 'https://www.ryu-legal.com',
  },
  {
    title: 'Blockchain Ledger Simulator',
    description:
      'A Java and Thymeleaf project that simulates a blockchain ledger with hashed transactions and visual block tracking.',
  },
  {
    title: 'React + Django Sign-In Prototype',
    description:
      'A static React app with login functionality wired to a Django backend. Illustrates frontend/back-end communication and state handling.',
  },
];

export default function Projects() {
  return (
    <section id="projects" className="bg-zinc-800 text-zinc-100 py-0">
      {/* Top Bar */}
      <div className="bg-zinc-900 py-8">
        <h2 className="text-4xl font-bold text-center">Projects</h2>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {projects.map(({ title, description, link }) => (
            <div
              key={title}
              className="bg-zinc-700 p-6 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:scale-105 flex flex-col"
            >
              <h3 className="text-xl font-semibold mb-4">{title}</h3>
              <p className="text-zinc-300 flex-grow">{description}</p>
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-blue-400 hover:text-blue-500 transition"
                >
                  Visit site <FaExternalLinkAlt className="ml-2" />
                </a>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
