import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHtml5, FaJsSquare, FaPython, FaJava, FaDatabase, FaReact, FaDocker, FaAws,
  FaGithub, FaLinux, FaUnity, FaGamepad
} from 'react-icons/fa';
import {
  SiNextdotjs, SiDjango, SiSpringboot, SiTailwindcss, SiFramer, SiReacthookform,
  SiPostgresql, SiSqlite, SiVercel, SiGithubactions, SiEslint, SiPostman, SiJunit5,
  SiGooglemaps, SiTrello, SiGimp, SiUnrealengine, SiNextdotjs as SiNextSEO
} from 'react-icons/si';
import { FiCode, FiGlobe, FiMail } from 'react-icons/fi';

interface Skill {
  name: string;
  level: number;
  Icon: React.ElementType;
}

interface SkillCategory {
  category: string;
  skills: Skill[];
  additional?: string;
}

const skillCategories: SkillCategory[] = [
  {
    category: 'Core Programming Languages',
    skills: [
      { name: 'HTML / CSS', level: 4, Icon: FaHtml5 },
      { name: 'JavaScript / TypeScript', level: 4, Icon: FaJsSquare },
      { name: 'Python', level: 3, Icon: FaPython },
      { name: 'Java', level: 3, Icon: FaJava },
      { name: 'SQL', level: 3, Icon: FaDatabase },
      { name: 'C++', level: 1, Icon: FiCode }
    ],
    additional: 'Markdown · YAML'
  },
  {
    category: 'Frontend Development',
    skills: [
      { name: 'React', level: 3, Icon: FaReact },
      { name: 'Next.js', level: 4, Icon: SiNextdotjs },
      { name: 'Tailwind CSS', level: 4, Icon: SiTailwindcss },
      { name: 'Framer Motion', level: 4, Icon: SiFramer },
      { name: 'React Hook Form / Yup', level: 4, Icon: SiReacthookform },
      { name: 'GIMP', level: 3, Icon: SiGimp }
    ],
    additional: 'Bootstrap · SASS / SCSS · Figma · ComfyUI · Thymeleaf (server-side rendering)'
  },
  {
    category: 'Backend & API Development',
    skills: [
      { name: 'Spring Boot', level: 3, Icon: SiSpringboot },
      { name: 'Django', level: 2, Icon: SiDjango },
      { name: 'RESTful APIs', level: 3, Icon: FiGlobe },
      { name: 'Email APIs (Resend)', level: 4, Icon: FiMail },
      { name: '3rd-Party APIs (Google Maps)', level: 4, Icon: SiGooglemaps }
    ],
    additional: 'i18n'
  },
  {
    category: 'Databases & Data Access',
    skills: [
      { name: 'PostgreSQL', level: 2, Icon: SiPostgresql },
      { name: 'SQLite', level: 3, Icon: SiSqlite },
      { name: 'Hibernate', level: 2, Icon: FaDatabase },
      { name: 'Spring Data JPA', level: 2, Icon: FaDatabase },
      { name: 'Django ORM', level: 2, Icon: SiDjango },
      { name: 'MyBatis', level: 2, Icon: FaDatabase }
    ]
  },
  {
    category: 'DevOps & Infrastructure',
    skills: [
      { name: 'Docker', level: 4, Icon: FaDocker },
      { name: 'AWS (EC2, RDS, S3)', level: 3, Icon: FaAws },
      { name: 'GitHub Actions (CI/CD)', level: 4, Icon: SiGithubactions },
      { name: 'Linux', level: 3, Icon: FaLinux },
      { name: 'Deployment (Vercel)', level: 4, Icon: SiVercel }
    ],
    additional: 'Gradle · Webpack · Networking Fundamentals'
  },
  {
    category: 'Testing & Code Quality',
    skills: [
      { name: 'Postman', level: 4, Icon: SiPostman },
      { name: 'JUnit 5', level: 3, Icon: SiJunit5 },
      { name: 'Spring Boot Test Suite', level: 3, Icon: SiSpringboot },
      { name: 'ESLint', level: 3, Icon: SiEslint }
    ],
    additional: 'AssertJ'
  },
  {
    category: 'Tooling, Workflow & SEO',
    skills: [
      { name: 'Git / GitHub', level: 4, Icon: FaGithub },
      { name: 'SEO Optimization (Next SEO)', level: 4, Icon: SiNextSEO },
      { name: 'Project Tools: Trello / Notion', level: 4, Icon: SiTrello }
    ]
  },
  {
    category: 'Creative & Game Tech',
    skills: [
      { name: 'Unity', level: 1, Icon: FaUnity },
      { name: 'Unreal Engine', level: 2, Icon: SiUnrealengine },
      { name: 'GameMaker Studio', level: 2, Icon: FaGamepad }
    ],
    additional: 'MATLAB (academic use)'
  }
];

export default function Skills() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(
      skillCategories.map(({ category }) => [
        category,
        ['Core Programming Languages', 'Frontend Development', 'Backend & API Development'].includes(category)
      ])
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
      [category]: !prev[category]
    }));
  };

  const barColors = ['bg-green-400', 'bg-teal-400', 'bg-blue-400', 'bg-purple-400'];

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
        {skillCategories.map(({ category, skills, additional }) => {
          const isOpen = openSections[category];
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px 0px -100px 0px' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mb-16"
            >
              <button
                onClick={() => toggleSection(category)}
                className={`w-full text-left flex justify-between items-center text-2xl font-semibold mb-4 border-b pb-2 cursor-pointer ${
                  isDark ? 'border-zinc-700' : 'border-zinc-300'
                }`}
              >
                <span>{category}</span>
                <motion.svg
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
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
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="overflow-visible"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                      {skills.map(({ name, level, Icon }) => (
                        <div
                          key={name}
                          className={`p-6 rounded-2xl shadow-md hover:shadow-lg hover:shadow-blue-400/40 transform hover:scale-103 transition-all flex flex-col ${
                            isDark ? 'bg-zinc-700' : 'bg-zinc-200'
                          }`}
                        >
                          <div className="flex items-center space-x-4 mb-6">
                            <Icon className={`text-4xl ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                            <span className="text-lg font-semibold">{name}</span>
                          </div>
                          <div className="mt-auto flex gap-2 h-[2px]">
                            {Array.from({ length: 4 }, (_, i) => (
                              <div
                                key={i}
                                className={`flex-1 rounded-full ${
                                  i < level ? barColors[i] : isDark ? 'bg-zinc-500' : 'bg-zinc-400'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {additional && (
                      <p className={`text-base mt-6 font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        Additional: {additional}
                      </p>
                    )}
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
