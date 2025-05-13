// src/components/Footer.tsx
import { useTheme } from 'next-themes';

export default function Footer({ openAbout }: { openAbout: () => void }) {
  const { resolvedTheme } = useTheme();

  const bgFooter = resolvedTheme === 'dark' ? 'bg-zinc-900 text-zinc-400' : 'bg-zinc-200 text-zinc-600';
  const hoverText = resolvedTheme === 'dark' ? 'hover:text-white' : 'hover:text-black';

  return (
    <footer className={`${bgFooter} text-sm transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          © {new Date().getFullYear()} Edward Song. All rights reserved.
        </div>
        <div className="flex space-x-6">
          <a
            href="mailto:you@example.com"
            className={`${hoverText} transition`}
            aria-label="Email"
          >
            Email
          </a>
          <a
            href="https://linkedin.com/in/yourprofile"
            target="_blank"
            rel="noopener noreferrer"
            className={`${hoverText} transition`}
            aria-label="LinkedIn"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className={`${hoverText} transition`}
            aria-label="GitHub"
          >
            GitHub
          </a>
          <button
            onClick={openAbout}
            className={`${hoverText} transition`}
            aria-label="About Me"
          >
            About Me
          </button>
        </div>
      </div>
    </footer>
  );
}
