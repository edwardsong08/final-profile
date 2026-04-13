import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoSrc: string;
  label?: string;
  posterSrc?: string;
}

export default function VideoModal({
  isOpen,
  onClose,
  title,
  videoSrc,
  label,
  posterSrc = '/claimchain-demo-poster.webp',
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { resolvedTheme } = useTheme();
  const bgColor =
    resolvedTheme === 'dark'
      ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
      : 'bg-zinc-100 border-zinc-300 text-zinc-800';
  const labelColor = resolvedTheme === 'dark' ? 'text-zinc-300' : 'text-zinc-700';

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isOpen) {
      const frameId = window.requestAnimationFrame(() => {
        const playPromise = videoElement.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    videoElement.pause();
    videoElement.currentTime = 0;
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg backdrop-brightness-90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`relative ${bgColor} mx-4 w-full max-w-4xl rounded-2xl border p-6 shadow-lg sm:p-8`}
            initial={{ scale: 0.94, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 40 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-5 top-3 text-2xl text-zinc-400 hover:text-white"
              aria-label="Close video modal"
            >
              &times;
            </button>

            <h2 className="mb-2 pr-6 text-center text-2xl font-semibold sm:text-3xl">{title}</h2>
            {label && <p className={`mb-5 text-center text-sm ${labelColor}`}>{label}</p>}

            <div className="overflow-hidden rounded-xl border border-zinc-500/30 bg-black">
              <video
                ref={videoRef}
                controls
                playsInline
                preload="metadata"
                poster={posterSrc}
                className="h-auto w-full"
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
