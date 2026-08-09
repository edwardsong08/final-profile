import { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExternalLinkAlt } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useDisplayTheme } from '../hooks/useDisplayTheme';
import { useModalDialog } from '../hooks/useModalDialog';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchDemo?: () => void;
  title: string;
  paragraphs: string[];
  link?: string;
  liveDemoLink?: string;
  roadmapLink?: string;
  demoVideoSrc?: string;
  demoDuration?: string;
}

export default function ProjectModal({
  isOpen,
  onClose,
  onWatchDemo,
  title,
  paragraphs,
  link,
  liveDemoLink,
  roadmapLink,
  demoVideoSrc,
  demoDuration,
}: ProjectModalProps) {
  const { isDark } = useDisplayTheme();
  const dialogRef = useModalDialog(isOpen, onClose);
  const titleId = useId();
  const bgColor =
    isDark
      ? 'bg-zinc-700 border-zinc-600 text-zinc-100'
      : 'bg-zinc-100 border-zinc-300 text-zinc-800';
  const textColor = isDark ? 'text-zinc-300' : 'text-zinc-700';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 backdrop-blur-lg backdrop-brightness-90 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`relative ${bgColor} rounded-2xl shadow-lg max-w-3xl w-full mx-4 p-8 overflow-y-auto max-h-[90vh] border`}
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-6 text-zinc-400 hover:text-white text-2xl"
              aria-label={`Close ${title} dialog`}
            >
              &times;
            </button>

            <h2 id={titleId} className="text-3xl font-semibold text-center mb-8">{title}</h2>

            {demoVideoSrc && onWatchDemo && (
              <div className="mb-6 flex justify-center">
                <button
                  type="button"
                  onClick={onWatchDemo}
                  className="rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300 hover:bg-blue-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
                >
                  Watch Demo • {demoDuration ?? '3:30'}
                </button>
              </div>
            )}

            <div className={`text-lg leading-relaxed space-y-6 mb-8 ${textColor}`}>
              {paragraphs.map((p, idx) => (
                <ReactMarkdown key={idx}>{p}</ReactMarkdown>
              ))}
            </div>

            {(liveDemoLink || roadmapLink || link) && (
              <div className="text-center flex flex-col gap-2">
                {liveDemoLink && (
                  <a
                    href={liveDemoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center text-blue-400 hover:text-blue-500 text-sm underline"
                  >
                    Visit Site <FaExternalLinkAlt className="ml-2" />
                  </a>
                )}

                {roadmapLink && (
                  <a
                    href={roadmapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center text-blue-400 hover:text-blue-500 text-sm underline"
                  >
                    Roadmap <FaExternalLinkAlt className="ml-2" />
                  </a>
                )}

                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center text-blue-400 hover:text-blue-500 text-sm underline"
                  >
                    {title === 'Ryu-Legal.com – Law Firm Website'
                      ? 'Visit Site'
                      : 'View GitHub Repository'}{' '}
                    <FaExternalLinkAlt className="ml-2" />
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
