// src/components/Footer.tsx
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function Footer({ openAbout }: { openAbout: () => void }) {
  const { resolvedTheme } = useTheme();
  const [emailCopied, setEmailCopied] = useState(false);
  const isDark = resolvedTheme === 'dark';

  const bgFooter = isDark ? 'bg-zinc-900 text-zinc-400' : 'bg-zinc-200 text-zinc-600';
  const hoverText = isDark ? 'hover:text-white' : 'hover:text-black';
  const dividerColor = isDark ? 'border-zinc-600' : 'border-zinc-400';
  const copiedText = isDark ? 'text-zinc-100' : 'text-zinc-900';

  useEffect(() => {
    if (!emailCopied) return;
    const timeoutId = window.setTimeout(() => setEmailCopied(false), 1400);
    return () => window.clearTimeout(timeoutId);
  }, [emailCopied]);

  const handleEmailClick = async () => {
    try {
      await navigator.clipboard.writeText('edwardsong08@gmail.com');
      setEmailCopied(true);
    } catch {
      setEmailCopied(false);
      window.location.href = 'mailto:edwardsong08@gmail.com';
    }
  };

  return (
    <footer className={`${bgFooter} transition-colors duration-300 text-sm`}>
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          © {new Date().getFullYear()} Edward Song. All rights reserved.
        </div>
        <div className="flex space-x-6">
          <button
            type="button"
            onClick={handleEmailClick}
            className={`${hoverText} transition-colors ${emailCopied ? copiedText : ''}`}
            aria-label="Email"
          >
            {emailCopied ? 'Copied' : 'Email'}
          </button>
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
          <a
            href="/Resume-Edward_Song.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={hoverText}
            aria-label="Resume"
          >
            Resume
          </a>
          <span className={`h-4 border-l ${dividerColor}`} aria-hidden="true" />
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
