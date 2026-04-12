import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { FiLayout, FiServer, FiDatabase, FiCloud, FiCpu, FiTool, FiPenTool } from 'react-icons/fi';

interface SkillCategory {
  category: string;
  skills: string[];
  context?: string;
  Icon: React.ElementType;
}

const skillCategories: SkillCategory[] = [
  {
    category: 'Frontend & UI Engineering',
    Icon: FiLayout,
    skills: [
      'React',
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Framer Motion',
      'React Hook Form',
      'Responsive UI',
      'Technical SEO / Lighthouse',
    ],
    context: 'Used in TROA public site, ClaimChain frontend, and Ryu Legal.',
  },
  {
    category: 'Backend & Platform Engineering',
    Icon: FiServer,
    skills: [
      'Java',
      'Spring Boot',
      'Go',
      'Python',
      'Node.js',
      'REST APIs',
      'Swagger / OpenAPI',
      'C++',
      'Business Workflow Logic',
      'JWT / Auth / RBAC',
      'Stripe / Webhooks',
      'Discord.js / Bot Integrations',
    ],
    context:
      'Used in ClaimChain, TROA platform work, chatbot/backend flows, and supporting backend systems.',
  },
  {
    category: 'Data & Persistence',
    Icon: FiDatabase,
    skills: ['PostgreSQL', 'Supabase', 'SQL', 'Hibernate / JPA', 'Spring Data JPA', 'SQLite', 'MyBatis', 'Supabase Security / RLS', 'Flyway'],
    context: 'Used in ClaimChain, TROA, and VZW Ledger.',
  },
  {
    category: 'Cloud, DevOps & Delivery',
    Icon: FiCloud,
    skills: ['AWS (EC2 / RDS / S3)', 'Docker', 'GitHub Actions', 'Cloudflare', 'Coolify', 'Vercel', 'Linux'],
    context: 'Used in TROA deployments/stability work, ClaimChain, and VZW Ledger.',
  },
  {
    category: 'AI / ML & Automation',
    Icon: FiCpu,
    skills: ['FastAPI', 'Gemini Integration', 'Advisory ML Workflows', 'uv', 'Machine Learning', 'Automation Scripting'],
    context: 'Used in TROA Gemini chatbot work and ClaimChain advisory ML flows.',
  },
  {
    category: 'Tooling, Quality & Workflow',
    Icon: FiTool,
    skills: ['Git / GitHub', 'Postman', 'JUnit 5', 'Spring Boot Test', 'ESLint', 'Resend', 'Google Maps API', 'Google Calendar API', 'Google Analytics / GA4', 'Linear / Monday / Trello / Notion'],
    context: 'Used across client work, TROA, ClaimChain, and Ryu Legal.',
  },
  {
    category: 'Design & Creative Tools',
    Icon: FiPenTool,
    skills: ['GIMP', 'Figma', 'ComfyUI'],
    context: 'Used for UI iteration, visual asset work, and creative workflow support.',
  },
];

export default function Skills() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sectionText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const sectionOverlay = isDark ? 'bg-black/60' : 'bg-[rgba(242,236,226,0.82)]';
  const headerSurface = isDark
    ? 'bg-zinc-800 border-b border-zinc-700 shadow-[0_1px_0_rgba(255,255,255,0.04)]'
    : 'bg-stone-300 border-b border-stone-400 shadow-[0_1px_0_rgba(255,255,255,0.55)]';
  const chipClass = isDark
    ? 'bg-zinc-700/80 border-zinc-600 text-zinc-100'
    : 'bg-stone-100/90 border-stone-300 text-zinc-800';
  const contextClass = isDark ? 'text-zinc-300' : 'text-zinc-600';
  const panelClass = isDark
    ? 'bg-zinc-900/80 border-white/14 backdrop-blur-[2px] shadow-[0_8px_20px_rgba(0,0,0,0.28)]'
    : 'bg-stone-200 border-stone-300 backdrop-blur-[2px] shadow-[0_6px_18px_rgba(41,37,36,0.10)]';
  const iconClass = isDark ? 'text-blue-300/90' : 'text-blue-600/80';

  return (
    <section className={`relative overflow-hidden transition-colors duration-300 transform-gpu ${sectionText}`}>
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/sectionsbackground.webp')" }}
      />
      <div className={`absolute inset-0 z-0 ${sectionOverlay}`} />

      <div className="relative z-10">
        <div className={`${headerSurface} py-8 transition-colors duration-300`}>
          <h2 className="text-4xl font-bold text-center">Skills</h2>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {skillCategories.map(({ category, skills, context, Icon }, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px 0px -80px 0px' }}
                transition={{ duration: 0.3, delay: index * 0.03, ease: 'easeOut' }}
                className={`rounded-xl border p-4 sm:p-5 transition-colors duration-300 hover:shadow-lg hover:shadow-blue-400/30 transition-transform transform hover:scale-[1.01] ${panelClass}`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <Icon className={`text-base sm:text-lg ${iconClass}`} />
                  <h3 className="text-base sm:text-lg font-semibold leading-tight">{category}</h3>
                </div>

                {context && <p className={`text-xs sm:text-sm mb-3 ${contextClass}`}>{context}</p>}

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium border ${chipClass}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
