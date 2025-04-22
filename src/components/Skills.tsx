// src/components/Skills.tsx
import { motion } from 'framer-motion';
import {
  FaHtml5,
  FaCss3Alt,
  FaJsSquare,
  FaPython,
  FaJava,
  FaDatabase,
  FaReact,
  FaDocker,
  FaAws,
  FaGithub,
  FaLinux,
  FaFigma,
  FaUnity,
  FaGamepad
} from 'react-icons/fa';
import {
  SiTypescript,
  SiNextdotjs,
  SiDjango,
  SiSpringboot,
  SiThymeleaf,
  SiTailwindcss,
  SiBootstrap,
  SiSass,
  SiFramer,
  SiReacthookform,
  SiPostgresql,
  SiSqlite,
  SiVercel,
  SiGithubactions,
  SiEslint,
  SiPostman,
  SiJunit5,
  SiGradle,
  SiWebpack,
  SiGooglemaps,
  SiTrello,
  SiNotion,
  SiGimp,
  SiUnrealengine,
  SiMarkdown
} from 'react-icons/si';
import {
  FiCode,
  FiMonitor,
  FiCheckCircle,
  FiServer,
  FiGlobe,
  FiMail,
  FiFileText,
  FiBox
} from 'react-icons/fi';

const skillCategories = [
  {
    category: 'Languages',
    skills: [
      { name: 'HTML / CSS', level: 4, Icon: FaHtml5 },
      { name: 'JavaScript / TypeScript', level: 4, Icon: FaJsSquare },
      { name: 'Python', level: 3, Icon: FaPython },
      { name: 'Java', level: 3, Icon: FaJava },
      { name: 'SQL', level: 3, Icon: FaDatabase },
      { name: 'C++ (basic)', level: 1, Icon: FiCode }
    ]
  },
  {
    category: 'Frameworks',
    skills: [
      { name: 'React', level: 3, Icon: FaReact },
      { name: 'Next.js', level: 4, Icon: SiNextdotjs },
      { name: 'Django', level: 2, Icon: SiDjango },
      { name: 'Spring Boot', level: 3, Icon: SiSpringboot },
      { name: 'Thymeleaf', level: 4, Icon: SiThymeleaf }
    ]
  },
  {
    category: 'Styling & UX',
    skills: [
      { name: 'Tailwind CSS', level: 4, Icon: SiTailwindcss },
      { name: 'Bootstrap', level: 4, Icon: SiBootstrap },
      { name: 'SASS / SCSS', level: 3, Icon: SiSass },
      { name: 'Responsive Design', level: 4, Icon: FiMonitor },
      { name: 'Framer Motion', level: 4, Icon: SiFramer },
      { name: 'React Hook Form', level: 4, Icon: SiReacthookform },
      { name: 'Yup', level: 4, Icon: FiCheckCircle },
      { name: 'Figma', level: 3, Icon: FaFigma }
    ]
  },
  {
    category: 'Databases & ORM',
    skills: [
      { name: 'PostgreSQL', level: 2, Icon: SiPostgresql },
      { name: 'SQLite', level: 3, Icon: SiSqlite },
      { name: 'Spring Data JPA', level: 2, Icon: FaDatabase },
      { name: 'Hibernate', level: 2, Icon: FaDatabase },
      { name: 'MyBatis', level: 2, Icon: FaDatabase },
      { name: 'Django ORM', level: 2, Icon: SiDjango }
    ]
  },
  {
    category: 'DevOps & Cloud',
    skills: [
      { name: 'AWS (EC2, RDS, S3)', level: 3, Icon: FaAws },
      { name: 'Docker', level: 4, Icon: FaDocker },
      { name: 'Vercel', level: 4, Icon: SiVercel },
      { name: 'GitHub Actions', level: 4, Icon: SiGithubactions },
      { name: 'Linux', level: 3, Icon: FaLinux },
      { name: 'Networking Fundamentals', level: 2, Icon: FiServer }
    ]
  },
  {
    category: 'Testing & Quality',
    skills: [
      { name: 'ESLint', level: 3, Icon: SiEslint },
      { name: 'Postman', level: 4, Icon: SiPostman },
      { name: 'Yup', level: 4, Icon: FiCheckCircle },
      { name: 'JUnit 5', level: 3, Icon: SiJunit5 },
      { name: 'AssertJ', level: 3, Icon: FiCheckCircle },
      { name: 'Spring Boot Starter Test', level: 3, Icon: SiSpringboot }
    ]
  },
  {
    category: 'Build & Backend Tooling',
    skills: [
      { name: 'I18n', level: 4, Icon: FiGlobe },
      { name: 'Gradle', level: 2, Icon: SiGradle },
      { name: 'Webpack', level: 2, Icon: SiWebpack },
      { name: 'Git / GitHub', level: 4, Icon: FaGithub },
      { name: 'Google Maps API', level: 4, Icon: SiGooglemaps },
      { name: 'Resend Email API', level: 4, Icon: FiMail },
      { name: 'Next SEO', level: 4, Icon: SiNextdotjs },
      { name: 'React DOM', level: 3, Icon: FaReact },
      { name: 'Markdown', level: 4, Icon: SiMarkdown },
      { name: 'YAML', level: 3, Icon: FiFileText },
      { name: 'Trello / Notion', level: 4, Icon: SiTrello }
    ]
  },
  {
    category: 'Creative & Visual Tools',
    skills: [
      { name: 'ComfyUI', level: 2, Icon: FiBox },
      { name: 'GIMP', level: 3, Icon: SiGimp },
      { name: 'Figma (Design)', level: 1, Icon: FaFigma }
    ]
  },
  {
    category: 'Game Dev / Other Tech (Basic)',
    skills: [
      { name: 'Unity (basic)', level: 1, Icon: FaUnity },
      { name: 'Unreal Engine (basic)', level: 2, Icon: SiUnrealengine },
      { name: 'GameMaker Studio (basic)', level: 2, Icon: FaGamepad },
      { name: 'MATLAB (academic)', level: 1, Icon: FiCode }
    ]
  }
];

export default function Skills() {
  return (
    <motion.section
      id="skills"
      className="py-16 bg-gray-100 dark:bg-gray-900"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-semibold text-center mb-8">Skills</h2>
        {skillCategories.map(({ category, skills }) => (
          <div key={category} className="mb-12">
            <h3 className="text-2xl font-bold mb-4">{category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map(({ name, level, Icon }) => (
                <div
                  key={name}
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex flex-col"
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <Icon className="text-4xl text-blue-600" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{name}</span>
                  </div>
                  <div className="mt-auto flex gap-2 h-3">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full ${
                          i < level ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
