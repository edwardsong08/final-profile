// src/components/AboutMeModal.tsx
import { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useDisplayTheme } from '../hooks/useDisplayTheme';
import { useModalDialog } from '../hooks/useModalDialog';

interface AboutMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutMeModal({ isOpen, onClose }: AboutMeModalProps) {
  const { isDark } = useDisplayTheme();
  const dialogRef = useModalDialog(isOpen, onClose);
  const titleId = useId();
  const bgColor = isDark ? 'bg-zinc-700 border-zinc-600 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-800';
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
            className={`aboutme-scroll relative ${bgColor} rounded-2xl shadow-lg max-w-3xl w-full mx-4 p-8 overflow-y-auto max-h-[90vh] border`}
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
              aria-label="Close About Me dialog"
            >
              &times;
            </button>

            <h2 id={titleId} className="text-3xl font-semibold text-center mb-8">About Me</h2>

            <div className="relative mx-auto mb-6 w-1/3 min-w-[240px] h-auto">
              <Image
                src="/about1.webp"
                alt="Edward Song"
                layout="responsive"
                width={300}
                height={400}
                className="rounded-lg"
              />
            </div>

            <p className={`text-lg leading-relaxed mb-8 text-center ${textColor}`}>
              Before software development, interests developed across an educational background in
              engineering and political science, plus professional experience in education, writing,
              and law.
            </p>

            <div className="relative mx-auto mb-6 w-1/3 min-w-[240px] h-auto">
              <Image
                src="/about2.webp"
                alt="Edward Song"
                layout="responsive"
                width={300}
                height={400}
                className="rounded-lg"
              />
            </div>

            <p className={`text-lg leading-relaxed mb-8 text-center ${textColor}`}>
              Teaching has shaped a durable approach: keep learning, stay patient with ambiguity, and
              translate complex ideas into clear actions. Legal-adjacent experience reinforced methodical
              thinking, and comedy writing reinforced perspective and curiosity. These habits continue to
              guide engineering and collaboration.
            </p>

            <div className="relative mx-auto mb-6 w-1/3 min-w-[240px] h-auto">
              <Image
                src="/about3.webp"
                alt="Edward Song"
                layout="responsive"
                width={300}
                height={400}
                className="rounded-lg"
              />
            </div>

            <p className={`text-lg leading-relaxed mb-8 text-center ${textColor}`}>
              Political, educational, and judicial reform remain strong interests.
              Free time often involves hiking, guitar projects, reading, and golfing.
            </p>

            <div className="relative mx-auto mb-4 w-1/3 min-w-[240px] h-auto">
              <Image
                src="/about4.webp"
                alt="Edward Song"
                layout="responsive"
                width={300}
                height={400}
                className="rounded-lg"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
