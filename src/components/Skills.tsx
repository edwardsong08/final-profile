import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

interface SkillCategory {
  category: string;
  skills: string[];
  context?: string;
}

const skillCategories: SkillCategory[] = [
  {
    category: 'Frontend & UI Engineering',
    skills: [
      'React',
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Framer Motion',
      'React Hook Form',
      'Responsive UI',
      'Technical SEO',
    ],
    context: 'Used in TROA public site, ClaimChain frontend, and Ryu Legal.',
  },
  {
    category: 'Backend & Platform Engineering',
    skills: [
      'Java',
      'Spring Boot',
      'Go',
      'Python',
      'Node.js',
      'REST APIs',
      'Swagger / OpenAPI',
      'C++',
      'Auth / Workflow Logic',
    ],
    context:
      'Used in ClaimChain, TROA platform work, chatbot/backend flows, and supporting backend systems.',
  },
  {
    category: 'Data & Persistence',
    skills: ['PostgreSQL', 'Supabase', 'SQL', 'Hibernate / JPA', 'Spring Data JPA', 'SQLite', 'MyBatis'],
    context: 'Used in ClaimChain, TROA, and VZW Ledger.',
  },
  {
    category: 'Cloud, DevOps & Delivery',
    skills: ['AWS (EC2 / RDS / S3)', 'Docker', 'GitHub Actions', 'Cloudflare', 'Coolify', 'Vercel', 'Linux'],
    context: 'Used in TROA deployments/stability work, ClaimChain, and VZW Ledger.',
  },
  {
    category: 'AI / ML & Automation',
    skills: ['FastAPI', 'Gemini Integration', 'Advisory ML Workflows', 'uv', 'Machine Learning', 'Automation Scripting'],
    context: 'Used in TROA Gemini chatbot work and ClaimChain advisory ML flows.',
  },
  {
    category: 'Tooling, Quality & Workflow',
    skills: ['Git / GitHub', 'Postman', 'JUnit 5', 'Spring Boot Test', 'ESLint', 'Resend', 'Google Maps API', 'Trello / Notion'],
    context: 'Used across client work, TROA, ClaimChain, and Ryu Legal.',
  },
  {
    category: 'Design & Creative Tools',
    skills: ['GIMP', 'Figma', 'ComfyUI'],
    context: 'Used for UI iteration, visual asset work, and creative workflow support.',
  },
];

const DEFAULT_OPEN_CATEGORIES = new Set([
  'Frontend & UI Engineering',
  'Backend & Platform Engineering',
  'Cloud, DevOps & Delivery',
]);

export default function Skills() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(
      skillCategories.map(({ category }) => [category, DEFAULT_OPEN_CATEGORIES.has(category)])
    )
  );

  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleSection = (category: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const chipClass = isDark
    ? 'bg-zinc-700/80 border-zinc-600 text-zinc-100'
    : 'bg-white/80 border-zinc-300 text-zinc-800';
  const contextClass = isDark ? 'text-zinc-300' : 'text-zinc-600';

  return (
    <section
      id="skills"
      className={`transition-colors duration-300 transform-gpu ${
        isDark ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-100 text-zinc-900'
      }`}
    >
      <div className={`${isDark ? 'bg-zinc-900' : 'bg-zinc-200'} py-8 transition-colors duration-300`}>
        <h2 className="text-4xl font-bold text-center">Skills</h2>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {skillCategories.map(({ category, skills, context }) => {
          const isOpen = openSections[category];
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px 0px -100px 0px' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mb-8"
            >
              <button
                onClick={() => toggleSection(category)}
                className={`w-full text-left flex justify-between items-center text-xl sm:text-2xl font-semibold pb-3 border-b ${
                  isDark ? 'border-zinc-700' : 'border-zinc-300'
                }`}
              >
                <span>{category}</span>
                <motion.svg
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.25 }}
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </motion.svg>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={`${category}-content`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`mt-4 rounded-xl border px-4 py-4 sm:px-5 sm:py-5 ${
                        isDark ? 'bg-zinc-800/70 border-zinc-700' : 'bg-white/70 border-zinc-200'
                      }`}
                    >
                      {context && <p className={`text-sm mb-4 ${contextClass}`}>{context}</p>}
                      <div className="flex flex-wrap gap-2.5">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${chipClass}`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
