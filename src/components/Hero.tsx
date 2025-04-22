// src/components/Hero.tsx
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <motion.section
      className="w-full h-screen flex items-center justify-center bg-blue-600 text-white px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-xl w-full flex flex-col items-center space-y-6 text-center">
        {/* Placeholder for picture */}
        <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-gray-700">
          Picture
        </div>

        {/* Intro text */}
        <p className="text-xl">
          Self‑taught software developer based in the New York Metropolitan Area.
        </p>

        {/* Icon links */}
        <div className="flex space-x-6 text-2xl">
          <a
            href="mailto:you@example.com"
            aria-label="Email"
            className="hover:text-gray-200 transition"
          >
            📧 Email
          </a>
          <a
            href="https://linkedin.com/in/yourprofile"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-gray-200 transition"
          >
            💼 LinkedIn
          </a>
          <a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-gray-200 transition"
          >
            🐱 GitHub
          </a>
        </div>

        {/* Tagline */}
        <p className="italic">Striving for a habit of excellence.</p>
      </div>
    </motion.section>
  );
}
