// src/components/Footer.tsx
import { useTheme } from 'next-themes';

export default function Footer({ openAbout }: { openAbout: () => void }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const bgFooter = isDark ? 'bg-zinc-900 text-zinc-400' : 'bg-zinc-200 text-zinc-600';
  const hoverText = isDark ? 'hover:text-white' : 'hover:text-black';

  return (
    <footer className={`${bgFooter} transition-colors duration-300 text-sm`}>
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          © {new Date().getFullYear()} Edward Song. All rights reserved.
        </div>
        <div className="flex space-x-6">
          <a
            href="mailto:edwardsong08@gmail.com"
            className={hoverText}
            aria-label="Email"
          >
            Email
          </a>
          <a
            href="https://www.linkedin.com/in/edward-y-song"
            target="_blank"
            rel="noopener noreferrer"
            className={hoverText}
            aria-label="LinkedIn"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/edwardsong08"
            target="_blank"
            rel="noopener noreferrer"
            className={hoverText}
            aria-label="GitHub"
          >
            GitHub
          </a>
          <button
            onClick={openAbout}
            className={hoverText}
            aria-label="About Me"
          >
            About Me
          </button>
        </div>
      </div>
    </footer>
  );
}
