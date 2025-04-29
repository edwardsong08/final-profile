// src/components/Footer.tsx
import { useState } from 'react';
import AboutMeModal from './AboutMeModal';

export default function Footer() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <footer className="bg-zinc-900 text-zinc-400 text-sm">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between">
          {/* Left side */}
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            © {new Date().getFullYear()} Edward Song. All rights reserved.
          </div>

          {/* Right side */}
          <div className="flex space-x-6">
            <a
              href="mailto:you@example.com"
              className="hover:text-white transition"
              aria-label="Email"
            >
              Email
            </a>
            <a
              href="https://linkedin.com/in/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
              aria-label="LinkedIn"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
              aria-label="GitHub"
            >
              GitHub
            </a>
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-white transition"
              aria-label="About Me"
            >
              About Me
            </button>
          </div>
        </div>
      </footer>

      <AboutMeModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
