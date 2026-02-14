// src/components/AboutMeModal.tsx
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from 'next-themes';

interface AboutMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutMeModal({ isOpen, onClose }: AboutMeModalProps) {
  const { resolvedTheme } = useTheme();
  const bgColor = resolvedTheme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-800';
  const textColor = resolvedTheme === 'dark' ? 'text-zinc-300' : 'text-zinc-700';

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
            className={`aboutme-scroll relative ${bgColor} rounded-2xl shadow-lg max-w-3xl w-full mx-4 p-8 overflow-y-auto max-h-[90vh] border`}
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-6 text-zinc-400 hover:text-white text-2xl"
            >
              &times;
            </button>

            <h2 className="text-3xl font-semibold text-center mb-8">About Me</h2>

            <div className="relative mx-auto mb-6 w-1/3 min-w-[240px] h-auto">
              <Image
                src="/about1.jpg"
                alt="About Me 1"
                layout="responsive"
                width={300}
                height={400}
                className="rounded-lg"
              />
            </div>

            <p className={`text-lg leading-relaxed mb-8 text-center ${textColor}`}>
              Before software development, I&apos;ve had the opportunity to explore many of my interests,
              including an educational background in engineering and political science and a professional
              background in education, writing, and law.
            </p>

            <div className="relative mx-auto mb-6 w-1/3 min-w-[240px] h-auto">
              <Image
                src="/about2.jpg"
                alt="About Me 2"
                layout="responsive"
                width={300}
                height={400}
                className="rounded-lg"
              />
            </div>

            <p className={`text-lg leading-relaxed mb-8 text-center ${textColor}`}>
              Teaching has always been a rewarding experience, and watching my students grow continues to inspire me.
              I will forever remain a teacher and a student—nurturing to others and unafraid to ask questions.
              The challenges I have faced in law have taught me that a methodical approach will always yield a solution,
              so I will apply this to every challenge that comes my way.
              Through writing comedy, I discovered that there are always new, valid perspectives,
              and I will remain vigilantly open-minded.
              Ultimately, these are the principles by which I live and approach software development.
            </p>

            <div className="relative mx-auto mb-6 w-1/3 min-w-[240px] h-auto">
              <Image
                src="/about3.jpg"
                alt="About Me 3"
                layout="responsive"
                width={300}
                height={400}
                className="rounded-lg"
              />
            </div>

            <p className={`text-lg leading-relaxed mb-8 text-center ${textColor}`}>
              I am passionate about political, educational, and judicial reforms.
              My free time is spent hiking with my dog, tampering as an amateur guitar luthier,
              reading, or playing golf.
            </p>

            <div className="relative mx-auto mb-4 w-1/3 min-w-[240px] h-auto">
              <Image
                src="/about4.jpg"
                alt="About Me 4"
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
