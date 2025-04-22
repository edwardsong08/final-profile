// src/components/About.tsx
import { motion } from 'framer-motion';

export default function About() {
  return (
    <motion.section
      id="about"
      className="py-16 bg-white dark:bg-gray-900"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center space-y-8">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          About Me
        </h2>

        {/* First image placeholder */}
        <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-500">Photo</span>
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Before software development, I've had the opportunity to explore many of my
          interests, including an educational background in engineering and political
          science and a professional background in education, writing, and law.
        </p>

        {/* Second image placeholder */}
        <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-500">Photo</span>
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Teaching has always been a rewarding experience, and watching my students grow
          continues to inspire me. I will forever remain a teacher and a student—nurturing
          to others and unafraid to ask questions. The challenges I have faced in law
          have taught me that a methodical approach will always yield a solution, so I will
          apply this to every challenge that comes my way. Through writing comedy, I discovered
          that there are always new, valid perspectives, and I will remain vigilantly open-minded.
          Ultimately, these are the principles by which I live and approach software development.
        </p>

        {/* Third image placeholder */}
        <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-500">Photo</span>
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          I am passionate about political, educational, and judicial reforms. My free time
          is spent hiking with my dog, tampering as an amateur guitar luthier, reading, or
          exploring new foods in the area.
        </p>
      </div>
    </motion.section>
  );
}
