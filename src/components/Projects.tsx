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
    <motion.section
      id="projects"
      className="py-16 bg-gray-100 dark:bg-gray-800"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-semibold text-center mb-8 text-gray-900 dark:text-gray-100">
          Projects
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {projects.map(({ title, description, link }) => (
            <div
              key={title}
              className="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 flex-grow">
                {description}
              </p>
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Visit site <FaExternalLinkAlt className="ml-1" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
